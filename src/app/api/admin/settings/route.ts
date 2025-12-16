import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAdminUser, logAdminAction } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminUser()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('category', { ascending: true })

        if (error) throw error

        return NextResponse.json({ settings: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const admin = await getAdminUser()
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { key, value } = await request.json()

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get existing setting to check if it's secret
        const { data: existingSetting } = await supabase
            .from('app_settings')
            .select('is_secret, value')
            .eq('key', key)
            .single()

        // Update setting
        const { error } = await supabase
            .from('app_settings')
            .update({
                value,
                updated_by: admin.user_id,
                updated_at: new Date().toISOString()
            })
            .eq('key', key)

        if (error) throw error

        // Log the action
        await logAdminAction(
            'setting_updated',
            'setting',
            key,
            {
                key,
                is_secret: existingSetting?.is_secret,
                changed_by: admin.email
            }
        )

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
