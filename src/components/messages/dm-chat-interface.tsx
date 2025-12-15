"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Loader2, FileIcon, X, SmilePlus } from "lucide-react"
import { useMediaViewer } from "@/lib/stores/media-viewer-store"
import { toast } from "sonner"
import { format } from "date-fns"
import { sendMessage } from "@/app/messages/actions"
import { toggleReaction } from "@/app/reactions/actions"
import { markMessagesAsRead } from "@/app/messages/unread-actions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
    id: string
    content: string
    author_id: string
    created_at: string
    attachments: string[]
    is_read?: boolean
    dm_channel_id?: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
    reactions?: { user_id: string, emoji: string }[]
}

interface DMChatInterfaceProps {
    channelId: string
    currentUserId: string
    otherUserId?: string
}

export function DMChatInterface({ channelId, currentUserId, otherUserId }: DMChatInterfaceProps) {
    const [messages, setMessages] = React.useState<Message[]>([])
    const [newMessage, setNewMessage] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSending, setIsSending] = React.useState(false)
    const [attachments, setAttachments] = React.useState<File[]>([])
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const handleReaction = async (messageId: string, emoji: string) => {
        // Optimistic update
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existing = msg.reactions?.find(r => r.user_id === currentUserId && r.emoji === emoji)
                let newReactions = msg.reactions || []

                if (existing) {
                    newReactions = newReactions.filter(r => r !== existing)
                } else {
                    newReactions = [...newReactions, { user_id: currentUserId, emoji }]
                }
                return { ...msg, reactions: newReactions }
            }
            return msg
        }))

        try {
            await toggleReaction(messageId, emoji, true)
        } catch (error) {
            console.error('Failed to toggle reaction', error)
        }
    }

    // Fetch initial messages
    React.useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('direct_messages')
                .select(`
                    id,
                    content,
                    author_id,
                    created_at,
                    attachments,
                    dm_channel_id,
                    is_read,
                    profiles:author_id (
                        full_name,
                        avatar_url
                    ),
                    reactions:direct_message_reactions (
                        user_id,
                        emoji
                    )
                `)
                .eq('dm_channel_id', channelId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error fetching messages:', error)
                toast.error('Failed to load messages')
            } else {
                setMessages(data as any as Message[])
                scrollToBottom()
                markMessagesAsRead(channelId)
            }
            setIsLoading(false)
        }

        fetchMessages()

        // Realtime subscription
        const channel = supabase
            .channel(`dm:${channelId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `dm_channel_id=eq.${channelId}`
                },
                async (payload) => {
                    // Fetch profile for the new message
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', payload.new.author_id)
                        .single()

                    const newMsg = {
                        ...payload.new,
                        profiles: profile || { full_name: 'Unknown', avatar_url: null },
                        reactions: []
                    } as any as Message

                    setMessages((prev) => [...prev, newMsg])
                    scrollToBottom()

                    if (newMsg.author_id !== currentUserId) {
                        markMessagesAsRead(channelId)
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'direct_message_reactions' },
                () => {
                    // Simple refresh for now
                    fetchMessages()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelId])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!newMessage.trim() && attachments.length === 0) || isSending) return

        setIsSending(true)

        try {
            const uploadedUrls: string[] = []

            // Upload attachments
            if (attachments.length > 0) {
                for (const file of attachments) {
                    const fileName = `${currentUserId}/dm-${channelId}/${Date.now()}-${file.name}`

                    const { error: uploadError } = await supabase.storage
                        .from('vault') // Reusing resources bucket
                        .upload(fileName, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('vault')
                        .getPublicUrl(fileName)

                    uploadedUrls.push(publicUrl)
                }
            }

            // Using server action for sending to keep logic cleaner especially if we add notification triggers later
            const result = await sendMessage(channelId, newMessage, uploadedUrls)

            if (result.error) throw new Error(result.error)

            setNewMessage("")
            setAttachments([])
        } catch (error: any) {
            console.error('Error sending message:', error?.message || error)
            toast.error(error?.message || 'Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files))
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No messages yet.</p>
                            <p className="text-sm">Be the first to say hello!</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.author_id === currentUserId
                            const showAvatar = i === 0 || messages[i - 1].author_id !== msg.author_id

                            return (
                                <div key={msg.id} className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'} group/msg relative ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 shrink-0 flex flex-col items-center">
                                        {showAvatar ? (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={msg.profiles.avatar_url || undefined} />
                                                <AvatarFallback>{msg.profiles.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                        ) : <div className="w-8" />}
                                    </div>

                                    <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        {showAvatar && (
                                            <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <span className="font-semibold text-slate-900 text-sm">
                                                    {msg.profiles.full_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {format(new Date(msg.created_at), 'p')}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`
                                            px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl
                                            ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                            }
                                        `}>
                                            {msg.content}
                                        </div>

                                        {/* Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {msg.attachments.map((url, idx) => {
                                                    const fileName = url.split('/').pop()?.split('-').slice(1).join('-') || 'File'
                                                    const isImg = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)

                                                    const handleOpen = (e: React.MouseEvent) => {
                                                        e.preventDefault()
                                                        useMediaViewer.getState().open(url, fileName)
                                                    }

                                                    if (isImg) {
                                                        return (
                                                            <div key={idx} className="relative h-32 w-48 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity" onClick={handleOpen}>
                                                                <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <div key={idx} onClick={handleOpen} className="flex items-center gap-2 p-2 bg-slate-100 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                                                            <FileIcon className="h-4 w-4 text-slate-500" />
                                                            <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{fileName}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Reactions - DM Version */}
                                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {Object.entries(msg.reactions?.reduce((acc: any, r: any) => {
                                                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                                                return acc
                                            }, {}) || {}).map(([emoji, count]: any) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                    className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 hover:bg-slate-100 ${msg.reactions?.some((r: any) => r.emoji === emoji && r.user_id === currentUserId) ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                                >
                                                    <span>{emoji}</span>
                                                    <span className="font-semibold">{count}</span>
                                                </button>
                                            ))}

                                            <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity`}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                                                            <SmilePlus className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                        <div className="flex gap-1 p-1">
                                                            {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded text-lg"
                                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs border border-slate-200">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <label className="cursor-pointer p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0">
                            <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                            <Paperclip className="h-5 w-5" />
                        </label>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[40px]"
                        />
                        <Button type="submit" size="icon" disabled={isSending || (!newMessage.trim() && attachments.length === 0)} className="rounded-full flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
