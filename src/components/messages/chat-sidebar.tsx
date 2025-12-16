"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Search, PenSquare, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Channel {
    id: string
    otherUser: {
        id: string
        full_name: string
        avatar_url: string | null
    }
    lastMessage: {
        content: string
        created_at: string
        author_id: string
        is_read: boolean
    } | null
    unreadCount: number
}

interface ChatSidebarProps {
    channels: Channel[]
    currentUserId: string
    className?: string
}

export function ChatSidebar({ channels, currentUserId, className }: ChatSidebarProps) {
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [open, setOpen] = React.useState(false)

    // Filter channels
    const filteredChannels = channels.filter(channel =>
        channel.otherUser.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background border-r border-border">
            {/* Header */}
            <div className="p-4 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Messages</h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <PenSquare className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Channel List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col p-2 gap-1">
                    {filteredChannels.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        filteredChannels.map((channel) => {
                            const isActive = pathname === `/messages/${channel.id}`
                            const isUnread = channel.unreadCount > 0

                            return (
                                <Link
                                    key={channel.id}
                                    href={`/messages/${channel.id}`}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 hover:bg-primary/15"
                                            : "hover:bg-secondary/50",
                                        isUnread && !isActive ? "bg-secondary/30" : ""
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarImage src={channel.otherUser.avatar_url || undefined} />
                                            <AvatarFallback>{channel.otherUser.full_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        {/* Online indicator placeholder */}
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-background/5" />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm font-semibold truncate",
                                                isUnread ? "text-foreground" : "text-foreground/80"
                                            )}>
                                                {channel.otherUser.full_name}
                                            </span>
                                            {channel.lastMessage && (
                                                <span className={cn(
                                                    "text-[10px]",
                                                    isUnread ? "text-primary font-bold" : "text-muted-foreground"
                                                )}>
                                                    {formatDistanceToNow(new Date(channel.lastMessage.created_at), { addSuffix: false })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className={cn(
                                                "text-xs truncate max-w-[140px]",
                                                isUnread ? "text-foreground font-medium" : "text-muted-foreground"
                                            )}>
                                                {channel.lastMessage ? (
                                                    <>
                                                        {channel.lastMessage.author_id === currentUserId && "You: "}
                                                        {channel.lastMessage.content}
                                                    </>
                                                ) : (
                                                    <span className="italic">No messages yet</span>
                                                )}
                                            </span>
                                            {channel.unreadCount > 0 && (
                                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                                                    {channel.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    // Mobile Trigger - improved button styling
    if (className?.includes("md:hidden")) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-foreground">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-r border-border">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Messages Navigation</SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        )
    }

    // Desktop
    return (
        <div className={cn("hidden md:block w-[320px] h-full shrink-0", className)}>
            <SidebarContent />
        </div>
    )
}
