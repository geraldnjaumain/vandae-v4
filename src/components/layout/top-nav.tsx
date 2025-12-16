"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getUnreadCount } from "@/app/messages/unread-actions"
import { getUnreadNotificationCount } from "@/app/notifications/actions"
import { CommandMenu } from "@/components/layout/command-menu"
import { VadeaLogoWithText } from "@/components/ui/logo"
import {
    LayoutDashboard,
    Bell,
    Calendar,
    FolderOpen,
    Users,
    GraduationCap,
    Settings,
    CheckSquare,
    Mail,
    Search,
    Menu,
    LogOut,
    User,
    BookOpen,
    Brain,
    TrendingUp
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import NiceAvatar, { genConfig } from "react-nice-avatar"
import { NotificationCenter } from "@/components/notifications/notification-center"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Messages", href: "/messages", icon: Mail },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Timetable", href: "/timetable", icon: Calendar },
    { name: "Resources", href: "/resources", icon: FolderOpen },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Flashcards", href: "/flashcards", icon: Brain },
    { name: "Assignments", href: "/assignments", icon: CheckSquare },
    { name: "Community", href: "/community", icon: Users },
    { name: "Advisor", href: "/ai-advisor", icon: GraduationCap },
    { name: "Research", href: "/research", icon: BookOpen },
]

export function TopNav() {
    const [profile, setProfile] = React.useState<any>(null)
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [unreadNotifCount, setUnreadNotifCount] = React.useState(0)
    const [isMounted, setIsMounted] = React.useState(false)
    const router = useRouter()
    const pathname = usePathname()

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        const fetchUnread = async () => {
            try {
                const count = await getUnreadCount()
                setUnreadCount(count)
                const notifCount = await getUnreadNotificationCount()
                setUnreadNotifCount(notifCount)
            } catch (error) {
                console.error("Failed to fetch unread counts", error)
            }
        }

        // Fetch user profile for avatar
        const fetchProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single()
                setProfile(data)
            }
        }

        fetchUnread()
        fetchProfile()
        const interval = setInterval(fetchUnread, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <>
            <CommandMenu />
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-blue-600 backdrop-blur supports-[backdrop-filter]:bg-blue-600/90 shadow-sm">
                <div className="flex h-16 w-full items-center px-4 md:px-6">
                    <div className="mr-4 hidden md:flex w-full h-full">
                        <Link href="/" className="mr-8 flex items-center space-x-2">
                            <VadeaLogoWithText className="scale-110" textClassName="text-white" />
                        </Link>
                        <nav className="flex items-center gap-4 text-base font-medium h-full">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const badgeCount = item.name === 'Messages' ? unreadCount : item.name === 'Notifications' ? unreadNotifCount : 0

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "transition-colors hover:text-white relative flex items-center gap-1.5 h-full px-1.5",
                                            isActive ? "text-white" : "text-white/70"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="hidden lg:inline-block text-sm">{item.name}</span>
                                        {badgeCount > 0 && (
                                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 lg:hidden"></span>
                                        )}
                                        {badgeCount > 0 && (
                                            <span className="hidden lg:flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                                                {badgeCount > 9 ? '9+' : badgeCount}
                                            </span>
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute bottom-3 left-0 right-0 h-[2px] bg-white rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>

                                )
                            })}
                        </nav>
                    </div>

                    {/* Notification Center */}
                    <NotificationCenter />

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 px-0 text-base hover:bg-white/10 text-white hover:text-white focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="pr-0">
                                <SheetHeader className="px-1">
                                    <SheetTitle>
                                        <VadeaLogoWithText />
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="grid gap-2 py-6 mr-4">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href
                                        const badgeCount = item.name === 'Messages' ? unreadCount : item.name === 'Notifications' ? unreadNotifCount : 0
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                                    isActive ? "bg-accent" : "transparent"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                                {badgeCount > 0 && (
                                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white">
                                                        {badgeCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )
                                    })}
                                    <div className="border-t my-2 pt-2">
                                        <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign out
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden text-white">
                            <span className="font-bold inline-block">Vadea</span>
                        </Link>
                    </div>

                    <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            <Button
                                variant="outline"
                                className="relative inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white/10 shadow-sm hover:bg-white/20 hover:text-white h-10 w-full justify-start text-white/70 md:w-[240px] lg:w-[300px] pr-12"
                                onClick={() => document.dispatchEvent(new Event("vadea:open-command-menu"))}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                <span>Search...</span>
                                <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border border-white/20 bg-black/20 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-white">
                                    <span className="text-xs">Ctrl</span>K
                                </kbd>
                            </Button>
                        </div>
                        <nav className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "@user"} />
                                            <AvatarFallback className="bg-muted">
                                                {isMounted ? (
                                                    <NiceAvatar style={{ width: '100%', height: '100%' }} {...genConfig()} />
                                                ) : (
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                My Account
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>
                    </div>
                </div>
            </header >
        </>
    )
}
