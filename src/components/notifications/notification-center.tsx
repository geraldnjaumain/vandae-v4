"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from "@/app/actions/notifications"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NotificationItem } from "./notification-item"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationCenter() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
        fetchUnreadCount()

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        const { data } = await getNotifications({ limit: 20 })
        if (data) {
            setNotifications(data)
        }
        setLoading(false)
    }

    const fetchUnreadCount = async () => {
        const count = await getUnreadNotificationCount()
        setUnreadCount(count)
    }

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id)
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
        setUnreadCount(Math.max(0, unreadCount - 1))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead()
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 h-8"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="h-4 w-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                            <p className="text-sm font-medium text-foreground mb-1">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We'll notify you when something important happens
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={handleMarkRead}
                                    onClose={() => setOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                setOpen(false)
                                window.location.href = "/notifications"
                            }}
                        >
                            View All Notifications
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
