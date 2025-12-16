"use server"

import { createClient } from "@/lib/supabase-server"
import { createNotification } from "./notifications"

/**
 * Create deadline reminder notifications for assignments due within 24 hours
 * Should be called via cron job or scheduled task
 */
export async function sendAssignmentReminders() {
    const supabase = await createClient()

    // Get assignments due in next 24 hours
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)

    const { data: assignments } = await supabase
        .from("tasks")
        .select("id, title, due_date, user_id")
        .eq("status", "pending")
        .lte("due_date", tomorrow.toISOString())
        .gte("due_date", new Date().toISOString())

    if (!assignments) return

    // Create notifications for each assignment
    for (const assignment of assignments) {
        await createNotification({
            userId: assignment.user_id,
            type: "assignment",
            title: "Assignment Due Soon",
            message: `"${assignment.title}" is due within 24 hours`,
            link: `/assignments/${assignment.id}`,
            metadata: {
                assignment_id: assignment.id,
                due_date: assignment.due_date,
            },
        })
    }

    return { count: assignments.length }
}

/**
 * Send flashcard review reminders for cards due today
 * Should be called daily (e.g., 8am)
 */
export async function sendFlashcardReminders() {
    const supabase = await createClient()

    // Get users with due flashcards
    const { data: stats } = await supabase
        .from("deck_statistics")
        .select("user_id, deck_id, deck_name, due_cards")
        .gt("due_cards", 0)

    if (!stats) return

    // Group by user
    const userDecks = new Map<string, Array<{ deck_id: string; deck_name: string; due_cards: number }>>()

    for (const stat of stats) {
        if (!userDecks.has(stat.user_id)) {
            userDecks.set(stat.user_id, [])
        }
        userDecks.get(stat.user_id)!.push({
            deck_id: stat.deck_id,
            deck_name: stat.deck_name,
            due_cards: stat.due_cards,
        })
    }

    // Send one notification per user summarizing all due decks
    for (const [userId, decks] of userDecks.entries()) {
        const totalDue = decks.reduce((sum, d) => sum + d.due_cards, 0)
        const deckNames = decks.map((d) => d.deck_name).join(", ")

        await createNotification({
            userId,
            type: "flashcard",
            title: "Flashcards Ready for Review",
            message: `You have ${totalDue} cards due across ${decks.length} deck(s): ${deckNames}`,
            link: "/flashcards",
            metadata: {
                total_due: totalDue,
                decks: decks.map((d) => d.deck_id),
            },
        })
    }

    return { users: userDecks.size, totalCards: Array.from(userDecks.values()).flat().reduce((sum, d) => sum + d.due_cards, 0) }
}

/**
 * Send notification when a new grade is posted
 */
export async function sendGradeNotification(userId: string, assignmentTitle: string, grade: number, maxGrade: number) {
    const percentage = Math.round((grade / maxGrade) * 100)

    await createNotification({
        userId,
        type: "grade",
        title: "New Grade Posted",
        message: `You received ${grade}/${maxGrade} (${percentage}%) on "${assignmentTitle}"`,
        link: "/assignments",
        metadata: {
            grade,
            max_grade: maxGrade,
            percentage,
        },
    })
}

/**
 * Send notification for community mentions or replies
 */
export async function sendCommunityNotification(
    userId: string,
    type: "mention" | "reply" | "post",
    message: string,
    link: string
) {
    await createNotification({
        userId,
        type: "community",
        title: type === "mention" ? "You were mentioned" : type === "reply" ? "New reply" : "New post",
        message,
        link,
        metadata: {
            notification_type: type,
        },
    })
}

/**
 * Send system-wide announcement
 */
export async function sendSystemAnnouncement(title: string, message: string, link?: string) {
    const supabase = await createClient()

    // Get all users
    const { data: users } = await supabase.from("profiles").select("id")

    if (!users) return

    // Create notification for each user
    const notifications = users.map((user) => ({
        user_id: user.id,
        type: "system",
        title,
        message,
        link: link || null,
        metadata: {},
    }))

    const { error } = await supabase.from("notifications").insert(notifications)

    if (error) {
        console.error("Error sending system announcement:", error)
        return { error: error.message }
    }

    return { count: notifications.length }
}
