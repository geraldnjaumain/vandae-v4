"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateNotificationPreferences(data: {
    emailNotifications: boolean
    communityUpdates: boolean
    taskReminders: boolean
    weeklyDigest: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('profiles')
        .update({
            notification_preferences: data,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) throw new Error("Failed to update notification preferences")
    revalidatePath('/settings')
    return { success: true }
}

export async function getNotificationPreferences() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single()

    return data?.notification_preferences || {
        emailNotifications: true,
        communityUpdates: true,
        taskReminders: true,
        weeklyDigest: false
    }
}
