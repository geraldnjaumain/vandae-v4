import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboardPage() {
    const admin = await requireAdmin()
    const supabase = await createClient()

    // Fetch statistics
    const { data: userStats } = await supabase
        .from('admin_user_stats')
        .select('*')
        .single()

    const { data: communityStats } = await supabase
        .from('admin_community_stats')
        .select('*')
        .single()

    const { data: aiStats } = await supabase
        .from('admin_ai_stats')
        .select('*')

    // Calculate total AI calls and cache hits
    const totalAICalls = aiStats?.reduce((sum, stat) => sum + (stat.total_cached || 0), 0) || 0
    const totalCacheHits = aiStats?.reduce((sum, stat) => sum + (stat.total_hits || 0), 0) || 0
    const cacheHitRate = totalAICalls > 0 ? ((totalCacheHits / (totalCacheHits + totalAICalls)) * 100).toFixed(1) : '0'

    // Fetch recent audit logs
    const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles (
                full_name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    System overview and statistics
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={userStats?.total_users || 0}
                    description={`+${userStats?.new_users_30d || 0} this month`}
                    icon="👥"
                />
                <StatCard
                    title="Active Users (7d)"
                    value={userStats?.active_users_7d || 0}
                    description={`${userStats?.pro_members || 0} pro members`}
                    icon="🟢"
                />
                <StatCard
                    title="Communities"
                    value={communityStats?.total_communities || 0}
                    description={`+${communityStats?.new_communities_30d || 0} this month`}
                    icon="🏘️"
                />
                <StatCard
                    title="AI Cache Hit Rate"
                    value={`${cacheHitRate}%`}
                    description={`${totalCacheHits} hits / ${totalAICalls} cached`}
                    icon="🤖"
                />
            </div>

            {/* AI Endpoint Stats */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>AI Usage by Endpoint</CardTitle>
                    <CardDescription>Cache performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {aiStats?.map((stat: any) => (
                            <div key={stat.endpoint} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{stat.endpoint}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stat.total_hits} hits, {stat.active_cache_entries} active entries
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{stat.total_cached}</p>
                                    <p className="text-xs text-muted-foreground">cached</p>
                                </div>
                            </div>
                        ))}
                        {(!aiStats || aiStats.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">
                                No AI usage data yet
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Admin Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Admin Actions</CardTitle>
                    <CardDescription>Audit log of recent administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentLogs?.map((log: any) => (
                            <div key={log.id} className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <div className="flex-1">
                                    <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        by {(log.profiles as any)?.full_name || 'Unknown'} •{' '}
                                        {new Date(log.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!recentLogs || recentLogs.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">
                                No audit logs yet
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, description, icon }: {
    title: string
    value: string | number
    description: string
    icon: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <span className="text-2xl">{icon}</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}
