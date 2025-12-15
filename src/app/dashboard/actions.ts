"use server"

import { createClient } from '@/lib/supabase-server'
import { Database } from '@/types/database.types'

type Timetable = Database['public']['Tables']['timetables']['Row']
type Resource = Database['public']['Tables']['resources']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Post = Database['public']['Tables']['posts']['Row'] & {
    profiles: {
        id: string
        full_name: string
        avatar_url: string | null
    } | null
    communities: {
        id: string
        name: string
    } | null
}

export async function getTodaysSchedule(userId: string): Promise<Timetable[]> {
    const supabase = await createClient()
    const now = new Date()
    // Start of today (00:00)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    // End of today (23:59)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // 1. Fetch one-off events for today
    const { data: oneOffs } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', false)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())

    // 2. Fetch ALL recurring events
    const { data: recurring } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', true)

    // 3. Filter recurring events that match TODAY's day of week
    const todayDayIndex = now.getDay() // 0=Sun
    const recurringForToday = (recurring || []).filter(evt => {
        const d = new Date(evt.start_time)
        return d.getDay() === todayDayIndex
    }).map(evt => {
        // Clone and adjust date to Today for correct sorting/display
        const originalStart = new Date(evt.start_time)
        const originalEnd = new Date(evt.end_time)

        const newStart = new Date(now)
        newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0)

        const newEnd = new Date(now)
        newEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0)

        // If end time is before start time (overnight), add 1 day (rare for classes but safe)
        if (newEnd < newStart) {
            newEnd.setDate(newEnd.getDate() + 1)
        }

        return {
            ...evt,
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString()
        }
    })

    // 4. Combine and Sort by Start Time
    const allEvents = [...(oneOffs || []), ...recurringForToday]

    allEvents.sort((a, b) => {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

    // Filter out events that already ended? Optional.
    // For now show all today's classes.
    return allEvents.slice(0, 5) // Show top 5
}

export async function getRecentResources(userId: string): Promise<Resource[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

    if (error) {
        console.error('Error fetching resources:', error)
        return []
    }

    return data || []
}

export async function getCommunityHighlights(userInterests: string[]): Promise<Post | null> {
    if (!userInterests || userInterests.length === 0) {
        return null
    }

    const supabase = await createClient()

    // Find communities matching user interests
    const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id')
        .in('topic_tag', userInterests)
        .limit(5)

    if (communitiesError || !communities || communities.length === 0) {
        return null
    }

    const communityIds = communities.map(c => c.id)

    // Get the most recent post from these communities
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles:author_id (
        id,
        full_name,
        avatar_url
      ),
      communities:community_id (
        id,
        name
      )
    `)
        .in('community_id', communityIds)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching community highlights:', error)
        return null
    }

    return data as Post
}

export async function getUpcomingTasks(userId: string): Promise<Task[]> {
    const supabase = await createClient()
    const { data } = await supabase.from('tasks')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .limit(3)
    return data || []
}

export async function getDashboardData() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Not authenticated', data: null }
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        const userInterests = profile?.interests || []

        // Fetch all data in parallel for maximum speed
        const [
            schedule,
            resources,
            communityPost,
            tasks,
            communities,
            notifications
        ] = await Promise.all([
            getTodaysSchedule(user.id),
            getRecentResources(user.id),
            getCommunityHighlights(userInterests),
            getUpcomingTasks(user.id),
            getUserCommunities(user.id),
            getUserNotifications(user.id)
        ])

        return {
            error: null,
            data: {
                schedule,
                resources,
                posts: communityPost ? [communityPost] : [],
                tasks,
                communities,
                notifications,
                profile
            }
        }
    } catch (error: any) {
        console.error('Dashboard data fetch error:', error)
        return {
            error: error.message || 'Failed to fetch dashboard data',
            data: null
        }
    }
}

async function getUserCommunities(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('community_members')
        .select('communities(*)')
        .eq('user_id', userId)
        .limit(5)

    return data?.map(d => d.communities).filter(Boolean) || []
}

async function getUserNotifications(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5)

    return data || []
}
