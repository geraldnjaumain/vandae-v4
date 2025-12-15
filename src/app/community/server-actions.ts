"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createChannel(communityId: string, name: string, type: 'text' | 'voice' | 'announcement') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check permissions
    const { data: member } = await supabase.from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    if (member?.role !== 'admin') {
        return { error: 'Only admins can create channels' }
    }

    // Determine position
    const { count } = await supabase.from('channels')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)

    const { error } = await supabase.from('channels').insert({
        community_id: communityId,
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type: type,
        position: (count || 0)
    })

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function getCommunityMembers(communityId: string) {
    const supabase = await createClient()

    const { data: members, error } = await supabase
        .from('community_members')
        .select(`
            role,
            profiles:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('community_id', communityId)
        .order('role', { ascending: true }) // Admin first roughly (alphabetical 'admin' < 'member')

    if (error) return []
    return members as any[]
}

export async function deleteChannel(channelId: string, communityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check permissions
    const { data: member } = await supabase.from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    if (member?.role !== 'admin') {
        return { error: 'Only admins can delete channels' }
    }

    const { error } = await supabase.from('channels').delete().eq('id', channelId)

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function updateMemberRole(communityId: string, userId: string, newRole: 'admin' | 'member' | 'moderator') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check if requester is admin
    const { data: requester } = await supabase.from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    if (requester?.role !== 'admin') {
        return { error: 'Only admins can manage roles' }
    }

    const { error } = await supabase.from('community_members')
        .update({ role: newRole })
        .eq('community_id', communityId)
        .eq('user_id', userId)

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function removeMember(communityId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check if requester is admin
    const { data: requester } = await supabase.from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    if (requester?.role !== 'admin') {
        return { error: 'Only admins can remove members' }
    }

    const { error } = await supabase.from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId)

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function searchUsers(query: string, communityId: string) {
    const supabase = await createClient()
    if (!query || query.length < 2) return []

    // 1. Search profiles
    const { data: profiles } = await supabase.from('profiles')
        .select('id, full_name, avatar_url, university, major')
        .ilike('full_name', `%${query}%`)
        .limit(20)

    if (!profiles || profiles.length === 0) return []

    // 2. Check which ones are already members
    const profileIds = profiles.map(p => p.id)
    const { data: existingMembers } = await supabase.from('community_members')
        .select('user_id')
        .eq('community_id', communityId)
        .in('user_id', profileIds)

    const existingMemberIds = new Set(existingMembers?.map(m => m.user_id))

    // 3. Return only non-members
    return profiles.filter(p => !existingMemberIds.has(p.id))
}

export async function addMember(communityId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check permissions
    const { data: member } = await supabase.from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    if (member?.role !== 'admin') {
        return { error: 'Only admins can add members' }
    }

    const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: userId,
        role: 'member'
    })

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}
