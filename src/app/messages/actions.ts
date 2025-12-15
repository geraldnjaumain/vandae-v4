"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createNotification } from "@/app/notifications/actions"

export async function createOrGetDirectMessageChannel(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // 1. Check if a DM channel already exists between these two users
    // This is a bit complex in Supabase w/o a dedicated function, but we can try to find an intersection
    const { data: myChannels } = await supabase.from('direct_message_participants')
        .select('dm_channel_id')
        .eq('user_id', user.id)

    const myChannelIds = myChannels?.map(c => c.dm_channel_id) || []

    if (myChannelIds.length > 0) {
        const { data: existingChannel } = await supabase.from('direct_message_participants')
            .select('dm_channel_id')
            .eq('user_id', targetUserId)
            .in('dm_channel_id', myChannelIds)
            .single()

        if (existingChannel) {
            return { id: existingChannel.dm_channel_id }
        }
    }

    // 2. Create new channel via RPC (handles participants too to avoid RLS issues)
    const { data: newChannelId, error: rpcError } = await supabase.rpc('create_dm_channel', {
        target_user_id: targetUserId
    })

    if (rpcError) {
        console.error("RPC Error:", rpcError)
        throw new Error("Failed to create DM channel")
    }

    if (!newChannelId) throw new Error("Failed to create DM channel")

    return { id: newChannelId }
}

export async function sendMessage(channelId: string, content: string, attachments: string[] = []) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase.from('direct_messages').insert({
        dm_channel_id: channelId,
        author_id: user.id,
        content,
        attachments
    })

    if (error) return { error: error.message }

    // Notify recipients
    const { data: participants } = await supabase.from('direct_message_participants')
        .select('user_id')
        .eq('dm_channel_id', channelId)
        .neq('user_id', user.id)

    if (participants) {
        for (const p of participants) {
            await createNotification({
                userId: p.user_id,
                title: "New Message",
                content: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
                type: 'message',
                link: `/messages/${channelId}`
            })
        }
    }

    revalidatePath(`/messages/${channelId}`) // Assuming this route
    revalidatePath(`/messages`)
    return { success: true }
}
