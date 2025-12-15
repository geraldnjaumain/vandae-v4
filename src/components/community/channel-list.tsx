"use client"

import * as React from "react"
import Link from "next/link"
import { Hash, Volume2, Pin, Trash2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeleteChannelDialog } from "./delete-channel-dialog"
import { CreateChannelDialog } from "./create-channel-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Channel {
    id: string
    name: string
    type: 'text' | 'voice' | 'announcement'
}

interface ChannelListProps {
    communityId: string
    channels: Channel[]
    currentChannelId: string
    isCommunityAdmin: boolean
    onSelect?: () => void
}

export function ChannelList({ communityId, channels, currentChannelId, isCommunityAdmin, onSelect }: ChannelListProps) {
    const textChannels = channels.filter(c => c.type !== 'voice')
    const voiceChannels = channels.filter(c => c.type === 'voice')

    return (
        <div className="space-y-6">
            {/* Text Channels */}
            <div className="space-y-0.5 group/channels">
                <div className="flex items-center justify-between px-2 mb-1">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Channels</h3>
                    {isCommunityAdmin && (
                        <CreateChannelDialog communityId={communityId} />
                    )}
                </div>
                {textChannels.map(channel => (
                    <div key={channel.id} className="relative group/item">
                        <Link
                            href={`/community/${communityId}?channel=${channel.name}`}
                            onClick={onSelect}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors relative z-0",
                                currentChannelId === channel.id
                                    ? "bg-indigo-50 text-indigo-900"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {channel.type === 'announcement' ? (
                                <Pin className={cn("h-4 w-4", currentChannelId === channel.id ? "text-indigo-500" : "text-slate-400")} />
                            ) : (
                                <Hash className={cn("h-4 w-4", currentChannelId === channel.id ? "text-indigo-500" : "text-slate-400")} />
                            )}
                            <span className="truncate">{channel.name}</span>
                        </Link>
                        {isCommunityAdmin && channel.name !== 'general' && channel.name !== 'announcements' && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200">
                                            <MoreVertical className="h-3 w-3 text-slate-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DeleteChannelDialog channelId={channel.id} communityId={communityId} channelName={channel.name}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Channel
                                            </DropdownMenuItem>
                                        </DeleteChannelDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Voice Channels */}
            <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2 flex items-center justify-between">
                    <span>Voice Channels</span>
                </h3>
                {voiceChannels.length > 0 ? (
                    voiceChannels.map(channel => (
                        <div key={channel.id} className="relative group/item">
                            <Link
                                href={`/community/${communityId}?channel=${channel.name}`}
                                onClick={onSelect}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors relative z-0",
                                    currentChannelId === channel.id
                                        ? "bg-slate-200/50 text-slate-900"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <Volume2 className="h-4 w-4 text-slate-500" />
                                <span className="truncate">{channel.name}</span>
                            </Link>
                            {isCommunityAdmin && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200">
                                                <MoreVertical className="h-3 w-3 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DeleteChannelDialog channelId={channel.id} communityId={communityId} channelName={channel.name}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Channel
                                                </DropdownMenuItem>
                                            </DeleteChannelDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <Link
                        href={`/community/${communityId}?channel=study-room`}
                        onClick={onSelect}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                            currentChannelId === 'study-room' ? "bg-slate-200/50 text-slate-900" : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <Volume2 className="h-4 w-4 text-slate-500" />
                        Study Room
                    </Link>
                )}
            </div>
        </div>
    )
}
