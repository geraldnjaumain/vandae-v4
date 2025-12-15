"use server"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createCommunity(data: {
    name: string
    description: string
    topicTag: string
    isPrivate: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 1. Create Community
    const { data: community, error } = await supabase.from('communities')
        .insert({
            name: data.name,
            description: data.description,
            topic_tag: data.topicTag,
            creator_id: user.id,
            is_private: data.isPrivate,
            member_count: 1
        })
        .select()
        .single()

    if (error) throw new Error("Failed to create community: " + error.message)

    // 2. Add Creator as Member (Admin)
    await supabase.from('community_members').insert({
        community_id: community.id,
        user_id: user.id,
        role: 'admin'
    })

    revalidatePath('/community')
    return community
}

export async function getCommunityDetails(communityId: string) {
    const supabase = await createClient()

    // 1. Fetch Community Info
    const { data: community, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single()

    if (error || !community) return null

    // 2. Fetch Posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:author_id (id, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

    return {
        community: community as any, // Cast to any to avoid strict schema type issues for now
        posts: posts || []
    }
}
