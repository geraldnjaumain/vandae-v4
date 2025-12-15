/**
 * Vadae Student OS - Supabase Database Types
 * Manually corrected to fix type inference issues
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    major: string | null
                    university: string | null
                    is_pro_member: boolean
                    interests: string[]
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    major?: string | null
                    university?: string | null
                    is_pro_member?: boolean
                    interests?: string[]
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    major?: string | null
                    university?: string | null
                    is_pro_member?: boolean
                    interests?: string[]
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            timetables: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    start_time: string
                    end_time: string
                    location: string | null
                    is_recurring: boolean
                    recurrence_pattern: string | null
                    color: string
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    start_time: string
                    end_time: string
                    location?: string | null
                    is_recurring?: boolean
                    recurrence_pattern?: string | null
                    color?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    start_time?: string
                    end_time?: string
                    location?: string | null
                    is_recurring?: boolean
                    recurrence_pattern?: string | null
                    color?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            resources: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    file_url: string
                    file_type: string
                    file_size: number | null
                    tags: string[]
                    description: string | null
                    is_public: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    file_url: string
                    file_type: string
                    file_size?: number | null
                    tags?: string[]
                    description?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    file_url?: string
                    file_type?: string
                    file_size?: number | null
                    tags?: string[]
                    description?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            communities: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    topic_tag: string | null
                    creator_id: string | null
                    avatar_url: string | null
                    banner_url: string | null
                    is_private: boolean
                    member_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    topic_tag?: string | null
                    creator_id?: string | null
                    avatar_url?: string | null
                    banner_url?: string | null
                    is_private?: boolean
                    member_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    topic_tag?: string | null
                    creator_id?: string | null
                    avatar_url?: string | null
                    banner_url?: string | null
                    is_private?: boolean
                    member_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            community_members: {
                Row: {
                    id: string
                    community_id: string
                    user_id: string
                    role: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    community_id: string
                    user_id: string
                    role?: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string
                    user_id?: string
                    role?: string
                    joined_at?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    community_id: string
                    author_id: string
                    content: string
                    attachments: string[]
                    likes_count: number
                    comments_count: number
                    is_pinned: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    community_id: string
                    author_id: string
                    content: string
                    attachments?: string[]
                    likes_count?: number
                    comments_count?: number
                    is_pinned?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string
                    author_id?: string
                    content?: string
                    attachments?: string[]
                    likes_count?: number
                    comments_count?: number
                    is_pinned?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            post_likes: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    created_at?: string
                }
                Relationships: []
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    due_date: string | null
                    priority: string
                    status: string
                    category: string | null
                    related_timetable_id: string | null
                    completed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    due_date?: string | null
                    priority?: string
                    status?: string
                    category?: string | null
                    related_timetable_id?: string | null
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    due_date?: string | null
                    priority?: string
                    status?: string
                    category?: string | null
                    related_timetable_id?: string | null
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            channels: {
                Row: {
                    id: string
                    community_id: string
                    name: string
                    type: 'text' | 'voice' | 'announcement'
                    position: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    community_id: string
                    name: string
                    type: 'text' | 'voice' | 'announcement'
                    position?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string
                    name?: string
                    type?: 'text' | 'voice' | 'announcement'
                    position?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            messages: {
                Row: {
                    id: string
                    channel_id: string
                    author_id: string
                    content: string
                    attachments: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    channel_id: string
                    author_id: string
                    content: string
                    attachments?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    channel_id?: string
                    author_id?: string
                    content?: string
                    attachments?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            direct_message_channels: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            direct_message_participants: {
                Row: {
                    id: string
                    dm_channel_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    dm_channel_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    dm_channel_id?: string
                    user_id?: string
                    created_at?: string
                }
                Relationships: []
            }
            direct_messages: {
                Row: {
                    id: string
                    dm_channel_id: string
                    author_id: string
                    content: string
                    attachments: string[] | null
                    is_read: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    dm_channel_id: string
                    author_id: string
                    content: string
                    attachments?: string[] | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    dm_channel_id?: string
                    author_id?: string
                    content?: string
                    attachments?: string[] | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            message_reactions: {
                Row: {
                    id: string
                    message_id: string
                    user_id: string
                    emoji: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    message_id: string
                    user_id: string
                    emoji: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    message_id?: string
                    user_id?: string
                    emoji?: string
                    created_at?: string
                }
                Relationships: []
            }
            direct_message_reactions: {
                Row: {
                    id: string
                    dm_message_id: string
                    user_id: string
                    emoji: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    dm_message_id: string
                    user_id: string
                    emoji: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    dm_message_id?: string
                    user_id?: string
                    emoji?: string
                    created_at?: string
                }
                Relationships: []
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    link: string | null
                    type: 'message' | 'alert' | 'community' | 'system'
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    link?: string | null
                    type: 'message' | 'alert' | 'community' | 'system'
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    link?: string | null
                    type?: 'message' | 'alert' | 'community' | 'system'
                    is_read?: boolean
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
