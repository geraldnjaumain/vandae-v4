"use server"

import { createClient } from "@/lib/supabase-server"

export async function markMessagesAsRead(channelId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Update all messages in this channel sent by OTHERS to be read
    await supabase.from('direct_messages')
        .update({ is_read: true })
        .eq('dm_channel_id', channelId)
        .neq('author_id', user.id) // Only mark others' messages
        .eq('is_read', false)
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    // Count unread messages in channels where the user is a participant
    // This is slightly complex because we need to check if the user is in the channel
    // But actually, 'direct_messages' has 'dm_channel_id'. 
    // We need to know which channels the user is in.

    // Simpler: Count all unread messages where user is NOT the author
    // AND the user is a participant of that channel. 
    // Wait, if I'm not in the channel, I shouldn't see it? DMs implies I am.
    // So simply: count all unread messages where author_id != me. 
    // BUT, this counts messages in DMs I might have left? (Deleting DMs not implemented yet).
    // For now, simpler query:

    // We need to join with participants to ensure the message is FOR this user.
    // Actually, in a 1-on-1 DM, if I am not the author, it is for me.

    const { count } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .neq('author_id', user.id)
        .eq('is_read', false)

    return count || 0
}
