"use client"

import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Users, Menu, Hash, Volume2 } from "lucide-react"
import { ChannelList } from "./channel-list"

interface MobileChannelListProps {
    communityId: string
    communityName: string
    channels: any[]
    currentChannelId: string
    isCommunityAdmin: boolean
}

export function MobileChannelList({
    communityId,
    communityName,
    channels,
    currentChannelId,
    isCommunityAdmin,
}: MobileChannelListProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5 text-slate-500" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-left flex items-center gap-2">
                        <span className="truncate">{communityName}</span>
                    </SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]">
                    <ChannelList
                        communityId={communityId}
                        channels={channels}
                        currentChannelId={currentChannelId}
                        isCommunityAdmin={isCommunityAdmin}
                        onSelect={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
