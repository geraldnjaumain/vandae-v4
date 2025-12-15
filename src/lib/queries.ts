/**
 * Vadae Student OS - Common Database Queries
 * Example queries for typical operations
 */

import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Timetable = Database['public']['Tables']['timetables']['Row']
type Resource = Database['public']['Tables']['resources']['Row']
type Community = Database['public']['Tables']['communities']['Row']
type Post = Database['public']['Tables']['posts']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

// ============================================
// PROFILE QUERIES
// ============================================

export async function getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) throw error
    return data as Profile
}

export async function updateUserProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

    if (error) throw error
    return data as Profile
}

export async function searchProfilesByInterest(interest: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .contains('interests', [interest])

    if (error) throw error
    return data as Profile[]
}

// ============================================
// TIMETABLE QUERIES
// ============================================

export async function getUserTimetables() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

    if (error) throw error
    return data as Timetable[]
}

export async function createTimetableEntry(entry: Omit<Timetable, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('timetables')
        .insert(entry)
        .select()
        .single()

    if (error) throw error
    return data as Timetable
}

export async function getTimetableForDateRange(startDate: Date, endDate: Date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .order('start_time', { ascending: true })

    if (error) throw error
    return data as Timetable[]
}

// ============================================
// TASK QUERIES
// ============================================

export async function getUserTasks(status?: 'todo' | 'in_progress' | 'completed') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data as Task[]
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) {
    const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

    if (error) throw error
    return data as Task
}

export async function completeTask(taskId: string) {
    const { data, error } = await supabase
        .from('tasks')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()

    if (error) throw error
    return data as Task
}

export async function getUpcomingTasks(daysAhead: number = 7) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysAhead)

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .lte('due_date', endDate.toISOString())
        .order('due_date', { ascending: true })

    if (error) throw error
    return data as Task[]
}

// ============================================
// RESOURCE QUERIES
// ============================================

export async function getUserResources() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Resource[]
}

export async function searchResourcesByTag(tag: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)
        .contains('tags', [tag])

    if (error) throw error
    return data as Resource[]
}

export async function createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single()

    if (error) throw error
    return data as Resource
}

// ============================================
// COMMUNITY QUERIES
// ============================================

export async function getAllCommunities() {
    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false })

    if (error) throw error
    return data as Community[]
}

export async function getUserCommunities() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('communities')
        .select(`
      *,
      community_members!inner(user_id)
    `)
        .eq('community_members.user_id', user.id)

    if (error) throw error
    return data as Community[]
}

export async function createCommunity(community: {
    name: string
    description?: string
    topic_tag?: string
    is_private?: boolean
}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create community
    const { data: newCommunity, error: communityError } = await supabase
        .from('communities')
        .insert({
            ...community,
            creator_id: user.id,
        })
        .select()
        .single()

    if (communityError) throw communityError

    // Auto-join creator as admin
    const { error: memberError } = await supabase
        .from('community_members')
        .insert({
            community_id: newCommunity.id,
            user_id: user.id,
            role: 'admin',
        })

    if (memberError) throw memberError

    return newCommunity as Community
}

export async function joinCommunity(communityId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('community_members')
        .insert({
            community_id: communityId,
            user_id: user.id,
            role: 'member',
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function leaveCommunity(communityId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id)

    if (error) throw error
}

// ============================================
// POST QUERIES
// ============================================

export async function getCommunityPosts(communityId: string) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles:author_id (
        id,
        full_name,
        avatar_url
      )
    `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createPost(communityId: string, content: string, attachments?: string[]) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('posts')
        .insert({
            community_id: communityId,
            author_id: user.id,
            content,
            attachments: attachments || [],
        })
        .select()
        .single()

    if (error) throw error
    return data as Post
}

export async function likePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('post_likes')
        .insert({
            post_id: postId,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function unlikePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

    if (error) throw error
}

export async function hasUserLikedPost(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

    return !error && !!data
}

// ============================================
// STORAGE HELPERS
// ============================================

export async function uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`

    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

    return publicUrl
}

export async function uploadResource(file: File, fileName: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath)

    return publicUrl
}

export async function deleteResource(filePath: string) {
    const { error } = await supabase.storage
        .from('resources')
        .remove([filePath])

    if (error) throw error
}
