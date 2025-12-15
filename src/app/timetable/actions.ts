"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type TimetableEvent = {
    id: string
    title: string
    start_time: string
    end_time: string
    location: string | null
    is_recurring: boolean
    recurrence_pattern: string | null
    color: string | null
    notes: string | null
}

export async function getTimetableEvents() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // We can't redirect in a data fetching function easily without throwing
        return []
    }

    // Fetch all events for the user
    // In a production app, you'd filter by date range (e.g., this month)
    // For MVP, we fetch all to ensure recurring events are found
    const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching timetable:', error)
        return []
    }

    return data as TimetableEvent[]
}

export async function createTimetableEvent(formData: {
    title: string
    start_time: string // ISO
    end_time: string   // ISO
    location?: string
    is_recurring: boolean
    color?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase.from('timetables').insert({
        user_id: user.id,
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? 'weekly' : null,
        color: formData.color || '#3b82f6'
    })

    if (error) {
        console.error('Error creating event:', error)
        throw new Error("Failed to create event")
    }

    revalidatePath('/timetable')
    revalidatePath('/dashboard') // Dashboard has schedule view
}

export async function deleteTimetableEvent(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting event:', error)
        throw new Error("Failed to delete event")
    }

    revalidatePath('/timetable')
    revalidatePath('/dashboard')
}

export async function updateTimetableEvent(id: string, formData: {
    title: string
    start_time: string
    end_time: string
    location?: string
    is_recurring: boolean
    color?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Verify ownership
    const { data: existing } = await supabase.from('timetables').select('user_id').eq('id', id).single()
    if (!existing || existing.user_id !== user.id) throw new Error("Unauthorized or Not Found")

    const { error } = await supabase.from('timetables')
        .update({
            title: formData.title,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location: formData.location,
            is_recurring: formData.is_recurring,
            recurrence_pattern: formData.is_recurring ? 'weekly' : null,
            color: formData.color || '#3b82f6'
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating event:', error)
        throw new Error("Failed to update event")
    }

    revalidatePath('/timetable')
    revalidatePath('/dashboard')
}
