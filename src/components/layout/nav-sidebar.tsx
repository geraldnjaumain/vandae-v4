"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getUnreadCount } from "@/app/messages/unread-actions"
import { getUnreadNotificationCount } from "@/app/notifications/actions"
import { CommandMenu } from "@/components/layout/command-menu"
import {
    LayoutDashboard,
    Bell,
    Calendar,
    FolderOpen,
    Users,
    Brain,
    Settings,
    Menu,
    X,
    CheckSquare,
    Mail,
    Search
} from "lucide-react"

import { VadeaLogoWithText, VadeaLogo } from "@/components/ui/logo"

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Messages",
        href: "/messages",
        icon: Mail,
    },
    {
        name: "Notifications",
        href: "/notifications",
        icon: Bell,
    },
    {
        name: "Timetable",
        href: "/timetable",
        icon: Calendar,
    },
    {
        name: "Resources",
        href: "/resources",
        icon: FolderOpen,
    },
    {
        name: "Assignments",
        href: "/assignments",
        icon: CheckSquare,
    },
    {
        name: "Community",
        href: "/community",
        icon: Users,
    },
    {
        name: "AI Advisor",
        href: "/ai-advisor",
        icon: Brain,
    },
]

const secondaryNav = [
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
    },
]

interface NavSidebarProps {
    className?: string
}

export function NavSidebar({ className }: NavSidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [unreadNotifCount, setUnreadNotifCount] = React.useState(0)

    React.useEffect(() => {
        const fetchUnread = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
            const notifCount = await getUnreadNotificationCount()
            setUnreadNotifCount(notifCount)
        }
        fetchUnread()

        // Simple polling for now
        const interval = setInterval(fetchUnread, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <CommandMenu />
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col border-r border-notion-border bg-background transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64",
                    className
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-notion-border">
                    {!isCollapsed && (
                        <Link href="/" className="flex items-center">
                            <VadeaLogoWithText />
                        </Link>
                    )}
                    {isCollapsed && (
                        <Link href="/" className="flex items-center justify-center w-full">
                            <VadeaLogo className="h-8 w-8" />
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            const badgeCount = item.name === 'Messages' ? unreadCount : item.name === 'Notifications' ? unreadNotifCount : 0

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                                        isActive
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}

                                    {badgeCount > 0 && (
                                        <div className={`
                                            bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center text-[10px]
                                            ${isCollapsed
                                                ? "absolute -top-1 -right-1 h-4 w-4 border border-white"
                                                : "ml-auto h-5 min-w-[20px] px-1"
                                            }
                                        `}>
                                            {badgeCount > 9 ? '9+' : badgeCount}
                                        </div>
                                    )}

                                    {/* Small dot for collapsed state if no number fits */}
                                    {badgeCount > 0 && isCollapsed && (
                                        <span className="sr-only">{badgeCount} unread</span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <Separator className="my-4" />

                    <nav className="space-y-1">
                        {secondaryNav.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>
                </ScrollArea>
            </aside>

            {/* Mobile Drawer */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="fixed top-4 left-4 z-40 h-10 w-10"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetHeader className="px-4 h-16 border-b border-notion-border flex flex-row items-center space-y-0">
                            <SheetTitle className="flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-sm">
                                        V
                                    </div>
                                    <span className="font-bold text-lg tracking-tight">Vadea</span>
                                </Link>
                            </SheetTitle>
                        </SheetHeader>

                        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <Separator className="my-4" />

                            <nav className="space-y-1">
                                {secondaryNav.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-slate-100 text-slate-900"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 right-4 z-40 h-10 w-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200 dark:border-zinc-700 shadow-sm rounded-full"
                    onClick={() => document.dispatchEvent(new Event("vadea:open-command-menu"))}
                >
                    <Search className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>
        </>
    )
}
