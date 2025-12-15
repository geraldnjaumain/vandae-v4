"use server"

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteAccount() {
    try {
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { error: 'You must be logged in to delete your account' }
        }

        // Delete user data (cascade delete will handle related records due to foreign keys)
        // The order matters: delete in reverse order of dependencies

        // 1. Delete from junction tables first
        await supabase.from('community_members').delete().eq('user_id', user.id)
        await supabase.from('post_likes').delete().eq('user_id', user.id)

        // 2. Delete posts (authored by user)
        await supabase.from('posts').delete().eq('author_id', user.id)

        // 3. Delete user's own data
        await supabase.from('tasks').delete().eq('user_id', user.id)
        await supabase.from('resources').delete().eq('user_id', user.id)
        await supabase.from('timetables').delete().eq('user_id', user.id)

        // 4. Delete communities created by user (optional: you might want to transfer ownership instead)
        await supabase.from('communities').delete().eq('creator_id', user.id)

        // 5. Delete profile (this should cascade due to foreign keys)
        await supabase.from('profiles').delete().eq('id', user.id)

        // 6. Finally, delete the auth user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            // Even if auth deletion fails, we've removed their data
            // Sign them out anyway
            await supabase.auth.signOut()
            revalidatePath('/', 'layout')
            redirect('/login')
        }

        // Sign out the user
        await supabase.auth.signOut()

        revalidatePath('/', 'layout')
        redirect('/')

    } catch (error: any) {
        console.error('Account deletion error:', error)
        return { error: 'An unexpected error occurred while deleting your account. Please contact support.' }
    }
}
