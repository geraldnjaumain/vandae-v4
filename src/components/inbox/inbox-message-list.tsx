"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface MessagePreview {
    channelId: string
    otherUser: {
        id: string
        full_name: string
        avatar_url: string | null
    }
    lastMessage: {
        content: string
        created_at: string
        author_id: string
    } | null
    unreadCount: number
}

export function InboxMessageList({ channelIds, currentUserId }: { channelIds: string[], currentUserId: string }) {
    const [messages, setMessages] = useState<MessagePreview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        let channels: any[] = []

        async function fetchMessages() {
            if (channelIds.length === 0) {
                setIsLoading(false)
                return
            }

            // Fetch all participants for these channels
            const { data: allParticipants } = await supabase
                .from('direct_message_participants')
                .select(`
                    dm_channel_id,
                    user_id,
                    profiles:user_id (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .in('dm_channel_id', channelIds)

            // Fetch last message for each channel
            const { data: lastMessages } = await supabase
                .from('direct_messages')
                .select('*')
                .in('dm_channel_id', channelIds)
                .order('created_at', { ascending: false })

            // Fetch unread counts
            const { data: unreadData } = await supabase
                .from('direct_messages')
                .select('dm_channel_id')
                .in('dm_channel_id', channelIds)
                .eq('is_read', false)
                .neq('author_id', currentUserId)

            // Count unread per channel
            const unreadCounts = (unreadData || []).reduce((acc: any, curr: any) => {
                acc[curr.dm_channel_id] = (acc[curr.dm_channel_id] || 0) + 1
                return acc
            }, {})

            // Build message previews
            const previews = channelIds.map(channelId => {
                const participants = allParticipants?.filter((p: any) => p.dm_channel_id === channelId) || []
                const otherParticipant = participants.find((p: any) => p.user_id !== currentUserId)
                const channelMessages = lastMessages?.filter((m: any) => m.dm_channel_id === channelId) || []
                const lastMessage = channelMessages[0]

                if (!otherParticipant) return null

                return {
                    channelId,
                    otherUser: otherParticipant.profiles,
                    lastMessage: lastMessage || null,
                    unreadCount: unreadCounts[channelId] || 0
                }
            }).filter(Boolean) as unknown as MessagePreview[]

            // Sort by last message time
            const sortPreviews = (list: MessagePreview[]) => {
                return [...list].sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.created_at || 0).getTime()
                    const timeB = new Date(b.lastMessage?.created_at || 0).getTime()
                    return timeB - timeA
                })
            }

            setMessages(sortPreviews(previews))
            setIsLoading(false)

            // Subscribe to realtime updates for EACH channel
            // Note: This might hit limits if user has many channels, but standard for now.
            channelIds.forEach(channelId => {
                const channel = supabase
                    .channel(`inbox:${channelId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'direct_messages',
                            filter: `dm_channel_id=eq.${channelId}`
                        },
                        (payload) => {
                            setMessages(current => {
                                const updated = current.map(msg => {
                                    if (msg.channelId === channelId) {
                                        const isMe = payload.new.author_id === currentUserId
                                        return {
                                            ...msg,
                                            lastMessage: payload.new as any,
                                            unreadCount: isMe ? msg.unreadCount : msg.unreadCount + 1
                                        }
                                    }
                                    return msg
                                })
                                return sortPreviews(updated)
                            })
                        }
                    )
                    .subscribe()
                channels.push(channel)
            })
        }

        fetchMessages()

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel))
        }
    }, [channelIds, currentUserId])

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (messages.length === 0) {
        return null
    }

    return (
        <Card>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {messages.map((msg) => (
                    <Link
                        key={msg.channelId}
                        href={`/messages/${msg.channelId}`}
                        className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${msg.unreadCount > 0 ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                            }`}
                    >
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={msg.otherUser.avatar_url || undefined} />
                                <AvatarFallback>{msg.otherUser.full_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            {msg.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-950">
                                    {msg.unreadCount > 9 ? '9+' : msg.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold truncate ${msg.unreadCount > 0 ? 'text-indigo-900 dark:text-indigo-100' : 'text-foreground'
                                    }`}>
                                    {msg.otherUser.full_name}
                                </h3>
                                {msg.lastMessage && (
                                    <span className={`text-xs whitespace-nowrap ml-2 ${msg.unreadCount > 0
                                        ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                                        : 'text-muted-foreground'
                                        }`}>
                                        {formatDistanceToNow(new Date(msg.lastMessage.created_at), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm truncate ${msg.unreadCount > 0
                                ? 'text-indigo-800 dark:text-indigo-200 font-medium'
                                : 'text-muted-foreground'
                                }`}>
                                {msg.lastMessage ? (
                                    <>
                                        {msg.lastMessage.author_id === currentUserId && "You: "}
                                        {msg.lastMessage.content}
                                    </>
                                ) : (
                                    <span className="italic">No messages yet</span>
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    )
}
