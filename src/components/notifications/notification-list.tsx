"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare, Users, Info, Check } from "lucide-react"
import { markAsRead, markAllAsRead } from "@/app/notifications/actions"
import { createClient } from "@/lib/supabase-browser"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
        await markAllAsRead()
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        router.refresh()
    }

    const handleClick = async (n: any) => {
        if (!n.is_read) {
            // Optimistic update
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item))
            markAsRead(n.id) // Fire and forget
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

    return (
        <div className="space-y-4">
            {notifications.length > 0 && notifications.some(n => !n.is_read) && (
                <div className="flex justify-end">
                    <Button variant="ghost" className="text-sm h-8" onClick={handleMarkAllRead}>
                        <Check className="mr-2 h-3 w-3" /> Mark all as read
                    </Button>
                </div>
            )}

            {notifications.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No notifications yet</p>
                </div>
            ) : (
                notifications.map(n => {
                    const Icon = icons[n.type as keyof typeof icons] || Bell
                    return (
                        <div
                            key={n.id}
                            onClick={() => handleClick(n)}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                n.is_read
                                    ? "bg-card border-border hover:border-accent"
                                    : "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-200 dark:hover:border-indigo-800"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full shrink-0",
                                n.is_read
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                    <p className={cn("font-medium text-sm leading-none pt-1", n.is_read ? "text-muted-foreground" : "text-foreground")}>
                                        {n.title}
                                    </p>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-1">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                {n.content && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.content}</p>}
                            </div>
                            {!n.is_read && (
                                <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                            )}
                        </div>
                    )
                })
            )}
        </div>
    )
}
