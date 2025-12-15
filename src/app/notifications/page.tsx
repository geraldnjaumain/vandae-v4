import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Bell } from "lucide-react"
import { getNotifications, markAllAsRead } from "./actions"
import { NotificationList } from "@/components/notifications/notification-list"
import { getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const notifications = await getNotifications()

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <Typography variant="h1" className="flex items-center gap-2">
                            <Bell className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            Notifications
                        </Typography>
                        <Typography variant="muted">
                            Recent alerts and updates.
                        </Typography>
                    </div>
                </div>

                <NotificationList initialNotifications={notifications} />
            </div>
        </AppLayout>
    )
}
