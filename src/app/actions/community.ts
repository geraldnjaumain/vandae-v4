"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createNotification } from '@/app/notifications/actions'

export async function createPost(communityId: string, content: string, attachments: string[] = []) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // Insert post
    const { error } = await supabase
        .from('posts')
        .insert({
            community_id: communityId,
            author_id: user.id,
            content,
            attachments
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/community')
    revalidatePath(`/community/${communityId}`)
    revalidatePath('/dashboard')
    return { success: true }
}

export async function toggleLike(postId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

    let error

    if (existingLike) {
        // Unlike
        const result = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
        error = result.error
    } else {
        // Like
        const result = await supabase
            .from('post_likes')
            .insert({
                post_id: postId,
                user_id: user.id,
            })
        error = result.error

        if (!error) {
            // Notify Author
            const { data: post } = await supabase.from('posts').select('author_id, content').eq('id', postId).single()
            if (post && post.author_id !== user.id) {
                await createNotification({
                    userId: post.author_id,
                    title: "New Like",
                    content: `Someone liked your post: "${post.content.substring(0, 30)}..."`,
                    type: 'community',
                    link: `/community`
                })
            }
        }
    }

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/community')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function joinCommunity(communityId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from('community_members')
        .insert({
            community_id: communityId,
            user_id: user.id,
            role: 'member'
        })

    if (error) {
        // Handle duplicate join gracefully
        if (error.code === '23505') { // Unique violation
            return { success: true }
        }
        return { error: error.message }
    }

    revalidatePath('/community')
    return { success: true }
}

async function getCommunityRole(communityId: string, userId: string) {
    const supabase: any = await createClient()
    const { data } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single()
    return data?.role
}

export async function deletePost(postId: string, communityId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Check ownership or admin status
    const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single()
    if (!post) return { error: "Post not found" }

    const role = await getCommunityRole(communityId, user.id)

    if (post.author_id !== user.id && role !== 'admin') {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function updatePost(postId: string, content: string, communityId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Check ownership
    const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single()
    if (!post) return { error: "Post not found" }

    if (post.author_id !== user.id) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId)

    if (error) return { error: error.message }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function togglePin(postId: string, communityId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const role = await getCommunityRole(communityId, user.id)

    if (role !== 'admin') {
        return { error: "Unauthorized: only admins can pin posts" }
    }

    // Get current status
    const { data: post } = await supabase
        .from('posts')
        .select('is_pinned, author_id, content')
        .eq('id', postId)
        .single()

    if (!post) return { error: "Post not found" }

    const newPinnedStatus = !post.is_pinned

    const { error } = await supabase
        .from('posts')
        .update({ is_pinned: newPinnedStatus })
        .eq('id', postId)

    if (error) return { error: error.message }

    if (newPinnedStatus && post.author_id !== user.id) {
        await createNotification({
            userId: post.author_id,
            title: "Post Pinned",
            content: `Your post in the community was pinned by an admin.`,
            type: 'community',
            link: `/community/${communityId}`
        })
    }

    revalidatePath(`/community/${communityId}`)
    return { success: true }
}

export async function createComment(postId: string, content: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }
    if (!content.trim()) return { error: "Content cannot be empty" }

    const { data, error } = await supabase
        .from('post_comments')
        .insert({
            post_id: postId,
            user_id: user.id,
            content
        })
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (
                id,
                full_name,
                avatar_url
            )
        `)
        .single()

    if (error) return { error: error.message }

    // Notify Author if not self
    const { data: post } = await supabase.from('posts').select('author_id, content').eq('id', postId).single()
    if (post && post.author_id !== user.id) {
        await createNotification({
            userId: post.author_id,
            title: "New Comment",
            content: `Someone commented on your post: "${post.content.substring(0, 30)}..."`,
            type: 'community',
            link: `/community` // Ideally deep link
        })
    }

    revalidatePath('/community')
    return { success: true, comment: data }
}

export async function getComments(postId: string) {
    const supabase: any = await createClient()

    // Auth check optional for public read, but good for connection
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('post_comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) return { error: error.message }
    return { comments: data }
}

export async function deleteComment(commentId: string, postId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Check ownership
    const { data: comment } = await supabase.from('post_comments').select('user_id').eq('id', commentId).single()
    if (!comment) return { error: "Comment not found" }
    if (comment.user_id !== user.id) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)

    if (error) return { error: error.message }

    revalidatePath('/community')
    return { success: true }
}
