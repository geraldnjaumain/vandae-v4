import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagementTable } from '@/components/admin/user-management-table'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string }
}) {
    await requireAdmin()
    const supabase = await createClient()

    const page = parseInt(searchParams.page || '1')
    const search = searchParams.search || ''
    const perPage = 20
    const offset = (page - 1) * perPage

    // Fetch users with search
    let query = supabase
        .from('profiles')
        .select('*, admin_users(role)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,university.ilike.%${search}%`)
    }

    const { data: users, count, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
    }

    const totalPages = count ? Math.ceil(count / perPage) : 0

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">
                    Manage user accounts and permissions
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({count || 0})</CardTitle>
                    <CardDescription>
                        Search, filter, and manage user accounts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserManagementTable
                        users={users || []}
                        currentPage={page}
                        totalPages={totalPages}
                        searchQuery={search}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
