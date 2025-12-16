import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityManagementTable } from '@/components/admin/community-management-table'

export default async function AdminCommunitiesPage({
    searchParams,
}: {
    searchParams: { page?: string }
}) {
    await requireAdmin()
    const supabase = await createClient()

    const page = parseInt(searchParams.page || '1')
    const perPage = 20
    const offset = (page - 1) * perPage

    // Fetch communities with creator info
    const { data: communities, count } = await supabase
        .from('communities')
        .select(`
            *,
            profiles!creator_id (
                full_name
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

    const totalPages = count ? Math.ceil(count / perPage) : 0

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Community Management</h1>
                <p className="text-muted-foreground">
                    Manage communities and moderate content
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Communities ({count || 0})</CardTitle>
                    <CardDescription>
                        View and manage study groups and communities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CommunityManagementTable
                        communities={communities || []}
                        currentPage={page}
                        totalPages={totalPages}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
