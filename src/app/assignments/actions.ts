"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export type Task = {
    id: string
    title: string
    description: string | null
    due_date: string | null
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'in_progress' | 'completed'
    category: string | null
    created_at: string
}

export async function getTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase.from('tasks')
        .select('*')
        .eq('user_id', user.id)

    if (error) {
        console.error(error)
        return []
    }

    // Sort in memory to handle custom priority/status order
    const statusOrder = { 'todo': 0, 'in_progress': 1, 'completed': 2 }
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }

    return (data as Task[]).sort((a, b) => {
        // 1. Status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status]
        }
        // 2. Priority
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        // 3. Due Date
        if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        if (a.due_date) return -1
        if (b.due_date) return 1

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export async function createTask(data: {
    title: string
    description?: string
    due_date?: string
    priority: string
    category?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        priority: data.priority,
        status: 'todo',
        category: data.category
    })

    if (error) throw new Error("Failed to create task")
    revalidatePath('/assignments')
}

export async function updateTaskStatus(id: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tasks')
        .update({ status })
        .eq('id', id)

    if (error) throw new Error("Failed to update task")
    revalidatePath('/assignments')
}

export async function updateTask(id: string, data: {
    title?: string
    description?: string
    due_date?: string
    priority?: 'low' | 'medium' | 'high'
    status?: 'todo' | 'in_progress' | 'completed'
    category?: string
}) {
    const supabase = await createClient()
    const { error } = await supabase.from('tasks')
        .update(data)
        .eq('id', id)

    if (error) throw new Error("Failed to update task")
    revalidatePath('/assignments')
}

export async function deleteTask(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tasks')
        .delete()
        .eq('id', id)

    if (error) throw new Error("Failed to delete task")
    revalidatePath('/assignments')
}
