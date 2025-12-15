import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, MessageSquare, CheckCheck } from "lucide-react"
import { createClient, getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/notifications/notification-list"
import { InboxMessageList } from "@/components/inbox/inbox-message-list"
import { Badge } from "@/components/ui/badge"

export default async function InboxPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const supabase = await createClient()

    // Fetch unread notifications count
    const { count: unreadNotificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    // Fetch unread DMs count
    const { data: unreadDMs } = await supabase
        .from('direct_messages')
        .select('dm_channel_id')
        .eq('is_read', false)
        .neq('author_id', user.id)

    // Get unique channel IDs for unread messages
    const unreadDMChannels = new Set(unreadDMs?.map(dm => dm.dm_channel_id) || [])
    const unreadMessagesCount = unreadDMChannels.size

    // Fetch recent notifications
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch DM channels for preview
    const { data: dmParticipants } = await supabase
        .from('direct_message_participants')
        .select(`
            dm_channel_id,
            direct_message_channels (
                id,
                updated_at
            )
        `)
        .eq('user_id', user.id)

    const channelIds = dmParticipants?.map(p => p.dm_channel_id) || []

    return (
        <AppLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Typography variant="h1" className="flex items-center gap-2">
                        <Bell className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        Inbox
                    </Typography>
                    {(unreadNotificationsCount || 0) + unreadMessagesCount > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                                {(unreadNotificationsCount || 0) + unreadMessagesCount} unread
                            </Badge>
                        </div>
                    )}
                </div>

                <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="notifications" className="gap-2 relative">
                            <Bell className="h-4 w-4" />
                            Notifications
                            {unreadNotificationsCount && unreadNotificationsCount > 0 ? (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="gap-2 relative">
                            <MessageSquare className="h-4 w-4" />
                            Messages
                            {unreadMessagesCount > 0 ? (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="mt-6 space-y-4">
                        {notifications && notifications.length > 0 ? (
                            <NotificationList initialNotifications={notifications} />
                        ) : (
                            <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-sm mb-4">
                                        <CheckCheck className="h-6 w-6 text-green-500" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">You&apos;re all caught up!</h3>
                                    <p className="text-sm text-muted-foreground">No new notifications to display.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="messages" className="mt-6">
                        {channelIds.length > 0 ? (
                            <InboxMessageList channelIds={channelIds} currentUserId={user.id} />
                        ) : (
                            <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-sm mb-4">
                                        <MessageSquare className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">No messages yet</h3>
                                    <p className="text-sm text-muted-foreground">Direct messages will appear here.</p>
                                    <p className="text-xs text-muted-foreground mt-2">Visit a community to start chatting with members.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
