import { NextResponse } from "next/server"
import { sendAssignmentReminders, sendFlashcardReminders } from "@/app/actions/notification-triggers"

/**
 * Cron job endpoint for sending scheduled notifications
 * Configure in vercel.json or run via external cron service
 * 
 * Usage:
 * - Assignment reminders: GET /api/cron/notifications?type=assignments
 * - Flashcard reminders: GET /api/cron/notifications?type=flashcards
 */
export async function GET(request: Request) {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    try {
        if (type === "assignments") {
            const result = await sendAssignmentReminders()
            return NextResponse.json({ success: true, ...result })
        }

        if (type === "flashcards") {
            const result = await sendFlashcardReminders()
            return NextResponse.json({ success: true, ...result })
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
