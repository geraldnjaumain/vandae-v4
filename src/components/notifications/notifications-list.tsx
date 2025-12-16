"use client"

import * as React from "react"
import { useState } from "react"
import {
    type Notification,
    markNotificationRead,
    archiveNotification,
    markAllNotificationsRead,
} from "@/app/actions/notifications"
import { NotificationItem } from "./notification-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Archive, Bell } from "lucide-react"

interface NotificationsListProps {
    initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
    const [notifications, setNotifications] = useState(initialNotifications)
    const [filter, setFilter] = useState<"all" | "unread">("all")

    const unreadCount = notifications.filter((n) => !n.read && !n.archived).length

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id)
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }

    const handleArchive = async (id: string) => {
        await archiveNotification(id)
        setNotifications(notifications.filter((n) => n.id !== id))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead()
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
    }

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.read
        return true
    })

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">
                            All ({notifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread ({unreadCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
                        <Check className="h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {filter === "unread" ? "All caught up!" : "No notifications yet"}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                        {filter === "unread"
                            ? "You've read all your notifications"
                            : "We'll notify you when something important happens"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="bg-card border border-border rounded-lg overflow-hidden"
                        >
                            <NotificationItem
                                notification={notification}
                                onMarkRead={handleMarkRead}
                                onClose={() => { }}
                            />
                            <div className="px-4 pb-3 flex justify-end gap-2">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkRead(notification.id)}
                                        className="gap-2"
                                    >
                                        <Check className="h-3 w-3" />
                                        Mark as read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleArchive(notification.id)}
                                    className="gap-2"
                                >
                                    <Archive className="h-3 w-3" />
                                    Archive
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
