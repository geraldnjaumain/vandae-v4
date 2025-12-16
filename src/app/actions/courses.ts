"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function getCourses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return data
}

export async function addCourse(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const course_code = formData.get('course_code') as string
    const course_name = formData.get('course_name') as string
    const instructor = formData.get('instructor') as string
    const semester = formData.get('semester') as string
    const description = formData.get('description') as string

    const { data, error } = await supabase
        .from('courses')
        .insert({
            user_id: user.id,
            course_code,
            course_name,
            instructor,
            semester,
            description
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding course:', error)
        return { error: error.message }
    }

    return { success: true, courseId: data.id, course: data }
}

export async function analyzeCourse(courseId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai-analyze-course`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId })
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: data.error || 'Failed to analyze course' }
        }

        return { success: true, data }
    } catch (error: any) {
        console.error('Error analyzing course:', error)
        return { error: error.message || 'Failed to analyze course' }
    }
}

export async function deleteCourse(courseId: string) {
    'use server'

    const supabase = await createClient()

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
