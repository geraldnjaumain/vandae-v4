"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// ===========================================
// TYPES
// ===========================================

export type NotificationType = "assignment" | "flashcard" | "community" | "system" | "grade"

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  archived: boolean
  metadata: Record<string, any>
  created_at: string
  read_at: string | null
}

export type NotificationPreferences = {
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  assignment_reminders: boolean
  flashcard_reminders: boolean
  community_updates: boolean
  grade_notifications: boolean
  system_announcements: boolean
  digest_frequency: "realtime" | "daily" | "weekly" | "never"
  quiet_hours_start: number
  quiet_hours_end: number
  created_at: string
  updated_at: string
}

// ===========================================
// NOTIFICATION MANAGEMENT
// ===========================================

/**
 * Get all notifications for current user
 */
export async function getNotifications(filter?: {
  read?: boolean
  type?: NotificationType
  limit?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (filter?.read !== undefined) {
    query = query.eq("read", filter.read)
  }

  if (filter?.type) {
    query = query.eq("type", filter.type)
  }

  if (filter?.limit) {
    query = query.limit(filter.limit)
  }

  const { data: notifications, error } = await query

  if (error) {
    console.error("Error fetching notifications:", error)
    return { error: error.message }
  }

  return { data: notifications }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return 0
  }

  const { data, error } = await supabase.rpc("get_unread_notification_count", {
    p_user_id: user.id,
  })

  if (error) {
    console.error("Error getting unread count:", error)
    return 0
  }

  return data || 0
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error marking notification read:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { data: { success: true } }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Error marking all read:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { data: { success: true } }
}

/**
 * Archive notification
 */
export async function archiveNotification(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ archived: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error archiving notification:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { data: { success: true } }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting notification:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { data: { success: true } }
}

// ===========================================
// NOTIFICATION CREATION
// ===========================================

/**
 * Create a notification for a user
 * Note: This should typically be called from server-side code only
 */
export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}) {
  const supabase = await createClient()

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      metadata: data.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    return { error: error.message }
  }

  return { data: notification }
}

// ===========================================
// PREFERENCES
// ===========================================

/**
 * Get notification preferences for current user
 */
export async function getNotificationPreferences() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: preferences, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching preferences:", error)
    return { error: error.message }
  }

  return { data: preferences }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  updates: Partial<Omit<NotificationPreferences, "user_id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: preferences, error } = await supabase
    .from("notification_preferences")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating preferences:", error)
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { data: preferences }
}
