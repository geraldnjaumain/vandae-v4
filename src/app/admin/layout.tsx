import { requireAdmin } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Check admin access
    const admin = await requireAdmin()

    return (
        <AppLayout>
            <div className="flex h-full">
                {/* Admin Sidebar */}
                <aside className="w-64 bg-card border-r border-border">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            {admin.full_name || admin.email}
                            <span className="block text-xs mt-1 text-primary">
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </span>
                        </p>

                        <nav className="space-y-2">
                            <AdminNavLink href="/admin" icon="📊">
                                Dashboard
                            </AdminNavLink>
                            <AdminNavLink href="/admin/users" icon="👥">
                                Users
                            </AdminNavLink>
                            <AdminNavLink href="/admin/communities" icon="🏘️">
                                Communities
                            </AdminNavLink>
                            {admin.role === 'super_admin' && (
                                <AdminNavLink href="/admin/settings" icon="⚙️">
                                    Settings
                                </AdminNavLink>
                            )}
                            <AdminNavLink href="/admin/audit-logs" icon="📝">
                                Audit Logs
                            </AdminNavLink>
                            <div className="pt-4 border-t border-border mt-4">
                                <AdminNavLink href="/dashboard" icon="← ">
                                    Back to Dashboard
                                </AdminNavLink>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </AppLayout>
    )
}

function AdminNavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
        >
            <span>{icon}</span>
            <span>{children}</span>
        </Link>
    )
}
