"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function toggleReaction(messageId: string, emoji: string, isDM: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const table = isDM ? 'direct_message_reactions' : 'message_reactions'
    const idField = isDM ? 'dm_message_id' : 'message_id'

    // Check if reaction exists
    const { data: existing } = await supabase.from(table)
        .select('id')
        .eq(idField, messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single()

    if (existing) {
        // Remove reaction
        await supabase.from(table).delete().eq('id', existing.id)
    } else {
        // Add reaction
        await supabase.from(table).insert({
            [idField]: messageId,
            user_id: user.id,
            emoji
        })
    }

    return { success: true }
}
