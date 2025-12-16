"use client"

import * as React from "react"
import { type Notification } from "@/app/actions/notifications"
import { cn } from "@/lib/utils"
import {
    Bell,
    CheckSquare,
    Brain,
    Users,
    AlertCircle,
    GraduationCap
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface NotificationItemProps {
    notification: Notification
    onMarkRead: (id: string) => void
    onClose: () => void
}

export function NotificationItem({ notification, onMarkRead, onClose }: NotificationItemProps) {
    const handleClick = () => {
        if (!notification.read) {
            onMarkRead(notification.id)
        }
        if (notification.link) {
            onClose()
            window.location.href = notification.link
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "assignment":
                return <CheckSquare className="h-5 w-5 text-blue-500" />
            case "flashcard":
                return <Brain className="h-5 w-5 text-purple-500" />
            case "community":
                return <Users className="h-5 w-5 text-green-500" />
            case "grade":
                return <GraduationCap className="h-5 w-5 text-orange-500" />
            case "system":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />
        }
    }

    const Component = notification.link ? "button" : "div"

    return (
        <Component
            onClick={handleClick}
            className={cn(
                "w-full p-4 transition-colors hover:bg-muted/50 text-left",
                !notification.read && "bg-primary/5",
                notification.link && "cursor-pointer"
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p
                            className={cn(
                                "text-sm font-medium leading-snug",
                                notification.read ? "text-muted-foreground" : "text-foreground"
                            )}
                        >
                            {notification.title}
                        </p>
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </Component>
    )
}
