/**
 * Admin Authentication Utilities
 * Middleware and helpers for admin route protection
 */

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export type AdminRole = 'super_admin' | 'admin'

export interface AdminUser {
    id: string
    user_id: string
    role: AdminRole
    email?: string
    full_name?: string
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return false

        const { data } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', user.id)
            .single()

        return !!data
    } catch {
        return false
    }
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return false

        const { data } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'super_admin')
            .single()

        return !!data
    } catch {
        return false
    }
}

/**
 * Get current admin user details
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data } = await supabase
            .from('admin_users')
            .select(`
                id,
                user_id,
                role,
                profiles (
                    full_name
                )
            `)
            .eq('user_id', user.id)
            .single()

        if (!data) return null

        return {
            id: data.id,
            user_id: data.user_id,
            role: data.role as AdminRole,
            email: user.email,
            full_name: (data.profiles as any)?.full_name
        }
    } catch {
        return null
    }
}

/**
 * Require admin access - redirect if not admin
 * Use this in server components and route handlers
 */
export async function requireAdmin(): Promise<AdminUser> {
    const admin = await getAdminUser()

    if (!admin) {
        redirect('/dashboard')
    }

    return admin
}

/**
 * Require super admin access - redirect if not super admin
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
    const admin = await getAdminUser()

    if (!admin || admin.role !== 'super_admin') {
        redirect('/dashboard')
    }

    return admin
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
    action: string,
    targetType?: string,
    targetId?: string,
    changes?: any
): Promise<void> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase.rpc('log_admin_action', {
            p_admin_id: user.id,
            p_action: action,
            p_target_type: targetType || null,
            p_target_id: targetId || null,
            p_changes: changes || null
        })
    } catch (error) {
        console.error('Failed to log admin action:', error)
    }
}
