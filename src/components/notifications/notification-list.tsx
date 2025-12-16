"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare, Users, Info, Check, Filter } from "lucide-react"
import { markAsRead, markAllAsRead } from "@/app/notifications/actions"
import { createClient } from "@/lib/supabase-browser"
import { formatDistanceToNow, isToday, isYesterday, isAfter, subDays } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

export function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
    const [notifications, setNotifications] = useState(initialNotifications)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        setNotifications(prev => [payload.new, ...prev])
                        router.refresh()
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setupRealtime()
    }, [])

    const handleMarkAllRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await markAllAsRead()
        router.refresh()
    }

    const handleClick = async (n: any) => {
        if (!n.is_read) {
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item))
            markAsRead(n.id)
            router.refresh()
        }
        if (n.link) router.push(n.link)
    }

    const icons = {
        message: MessageSquare,
        community: Users,
        alert: Bell,
        system: Info
    }

    // --- Filtering Logic ---
    const filterNotifications = (tab: string) => {
        if (tab === 'unread') return notifications.filter(n => !n.is_read)
        if (tab === 'system') return notifications.filter(n => n.type === 'system' || n.type === 'alert')
        return notifications
    }

    // --- Grouping Logic ---
    const groupNotifications = (list: any[]) => {
        const groups: { [key: string]: any[] } = {
            today: [],
            yesterday: [],
            week: [],
            older: []
        }

        list.forEach(n => {
            const date = new Date(n.created_at)
            if (isToday(date)) groups.today.push(n)
            else if (isYesterday(date)) groups.yesterday.push(n)
            else if (isAfter(date, subDays(new Date(), 7))) groups.week.push(n)
            else groups.older.push(n)
        })

        return groups
    }

    const NotificationGroup = ({ title, items }: { title: string, items: any[] }) => {
        if (items.length === 0) return null
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">{title}</h3>
                <div className="space-y-3">
                    {items.map(n => {
                        const Icon = icons[n.type as keyof typeof icons] || Bell
                        return (
                            <motion.div
                                layout
                                key={n.id}
                                onClick={() => handleClick(n)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={cn(
                                    "group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden",
                                    n.is_read
                                        ? "bg-card border-border hover:bg-accent/5"
                                        : "bg-gradient-to-r from-indigo-50/80 to-background dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/50 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "p-2.5 rounded-xl shrink-0 transition-colors",
                                    n.is_read
                                        ? "bg-secondary text-muted-foreground group-hover:bg-muted"
                                        : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1 z-10">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={cn(
                                            "font-medium text-sm leading-tight pr-8", // pr-8 to avoid overlapping right dot
                                            n.is_read ? "text-muted-foreground" : "text-foreground"
                                        )}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap pt-0.5 shrink-0">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {n.content && (
                                        <p className={cn(
                                            "text-xs line-clamp-2 leading-relaxed",
                                            n.is_read ? "text-muted-foreground/80" : "text-foreground/80"
                                        )}>
                                            {n.content}
                                        </p>
                                    )}
                                </div>
                                {!n.is_read && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950/50" />
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        )
    }

    const NotificationTabContent = ({ tab }: { tab: string }) => {
        const list = filterNotifications(tab)

        if (list.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 border-2 border-dashed border-muted rounded-xl"
                >
                    <div className="p-4 rounded-full bg-muted/50">
                        {tab === 'unread' ? <Check className="h-8 w-8 text-muted-foreground" /> : <Bell className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-lg">No notifications</p>
                        <p className="text-sm text-muted-foreground">
                            {tab === 'unread' ? "You're all caught up!" : "No messages to display here."}
                        </p>
                    </div>
                </motion.div>
            )
        }

        const groups = groupNotifications(list)

        return (
            <div className="space-y-8 animate-in fade-in-50 duration-500">
                <NotificationGroup title="Today" items={groups.today} />
                <NotificationGroup title="Yesterday" items={groups.yesterday} />
                <NotificationGroup title="Last 7 Days" items={groups.week} />
                <NotificationGroup title="Older" items={groups.older} />
            </div>
        )
    }

    const hasUnread = notifications.some(n => !n.is_read)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="all" className="px-4">All</TabsTrigger>
                            <TabsTrigger value="unread" className="px-4">Unread</TabsTrigger>
                            <TabsTrigger value="system" className="px-4">System</TabsTrigger>
                        </TabsList>

                        {hasUnread && (
                            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-muted-foreground hover:text-foreground hidden sm:flex">
                                <Check className="mr-2 h-4 w-4" /> Mark all read
                            </Button>
                        )}
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <NotificationTabContent tab="all" />
                    </TabsContent>

                    <TabsContent value="unread" className="mt-0">
                        <NotificationTabContent tab="unread" />
                    </TabsContent>

                    <TabsContent value="system" className="mt-0">
                        <NotificationTabContent tab="system" />
                    </TabsContent>
                </Tabs>

                {/* Mobile Mark Read Button */}
                {hasUnread && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="w-full sm:hidden">
                        <Check className="mr-2 h-4 w-4" /> Mark all read
                    </Button>
                )}
            </div>
        </div>
    )
}
