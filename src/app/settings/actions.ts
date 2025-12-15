"use server"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
    fullName: string
    major: string
    university: string
    interests: string[]
    avatarUrl?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.fullName,
            major: data.major,
            university: data.university,
            interests: data.interests,
            ...(data.avatarUrl && { avatar_url: data.avatarUrl }),
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) throw new Error("Failed to update profile")
    revalidatePath('/settings')
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    return data
}
