"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export type Resource = {
    id: string
    title: string
    file_url: string
    file_type: string
    file_size: number
    created_at: string
    is_public: boolean
}

export async function getResources() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching resources:', error)
        throw new Error("Failed to fetch resources")
    }

    return data as Resource[]
}

export async function createResource(data: {
    title: string
    file_url: string
    file_type: string
    file_size: number
    file_path: string // stored in description or just key? Wait, file_url is usually full URL or path?
    // The schema has file_url. I should probably store key there or full URL.
    // Let's store the full public URL or signed URL path?
    // Since bucket is private, we probably store the PATH and generate signed URLs on demand?
    // Or we store the path in file_url for now.
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Insert into DB
    const { error } = await supabase.from('resources').insert({
        user_id: user.id,
        title: data.title,
        file_url: data.file_url, // storage path
        file_type: data.file_type,
        file_size: data.file_size,
        description: data.title,
        is_public: false
    })

    if (error) {
        console.error('Error creating resource:', error)
        throw new Error("Failed to create resource record")
    }

    revalidatePath('/resources')
}

export async function deleteResource(id: string, storagePath: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // 1. Delete from Storage (We need to do this via Supabase Admin or Client? 
    // Server Action uses service key/cookie auth. Cookie auth has permissions!)
    // So we can delete from storage here if policies allow.

    // Attempt delete from storage
    const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([storagePath])

    if (storageError) {
        console.warn('Error deleting file from storage:', storageError)
        // We continue to delete record anyway to prevent orphan records
    }

    // 2. Delete from DB
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting resource:', error)
        throw new Error("Failed to delete resource")
    }

    revalidatePath('/resources')
}
