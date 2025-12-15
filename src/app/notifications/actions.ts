"use server"

import { createClient } from "@/lib/supabase-server"
import { Database } from "@/types/database.types"

type Notification = Database['public']['Tables']['notifications']['Row']

export async function getNotifications(): Promise<Notification[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error("Error fetching notifications", error)
        return []
    }
    return data
}

export async function getUnreadNotificationCount(): Promise<number> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    return count || 0
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
}

// Internal Server Action to be called by other actions
export async function createNotification(params: {
    userId: string
    title: string
    content?: string
    link?: string
    type: 'message' | 'alert' | 'community' | 'system'
}) {
    const supabase = await createClient()

    await supabase.from('notifications').insert({
        user_id: params.userId,
        title: params.title,
        content: params.content || null,
        link: params.link || null,
        type: params.type,
        is_read: false
    })

    // TODO: Integrate with Resend/SendGrid for email notifications
    // if (params.type === 'message') {
    //     console.log(`[Email] Sending notification to user ${params.userId}: ${params.title}`)
    // }
}
