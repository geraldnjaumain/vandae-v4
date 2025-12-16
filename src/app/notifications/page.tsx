import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Bell } from "lucide-react"
import { getNotifications, markAllAsRead } from "./actions"
import { NotificationList } from "@/components/notifications/notification-list"
import { getUser } from "@/lib/supabase-server"
import { getNotifications as getNotificationsAction } from "@/app/actions/notifications" // Renamed to avoid conflict
import { NotificationsList } from "@/components/notifications/notifications-list"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const { data: notifications } = await getNotificationsAction() // Using the renamed action

    return (
        <AppLayout>
            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground">Notifications</h1>
                        <p className="text-muted-foreground mt-2">
                            Stay updated with your assignments, flashcards, and community activity
                        </p>
                    </div>

                    <NotificationsList initialNotifications={notifications || []} />
                </div>
            </div>
        </AppLayout>
    )
}
