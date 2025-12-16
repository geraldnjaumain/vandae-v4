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
import { format, formatDistanceToNow } from "date-fns"
import { sendMessage } from "@/app/messages/actions"
import { toggleReaction } from "@/app/reactions/actions"
import { markMessagesAsRead } from "@/app/messages/unread-actions"
import { cn } from "@/lib/utils"
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
        <div className="flex flex-col h-full bg-background/50">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 max-w-4xl mx-auto pb-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SmilePlus className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1 text-foreground">No messages yet</h3>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.author_id === currentUserId
                            const showAvatar = i === 0 || messages[i - 1].author_id !== msg.author_id
                            const showTimestamp = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 1000 * 60 * 5)

                            return (
                                <div key={msg.id} className="space-y-1">
                                    {showTimestamp && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "flex gap-3 group/msg relative",
                                        isMe ? "flex-row-reverse" : ""
                                    )}>
                                        <div className="w-8 shrink-0 flex flex-col items-center">
                                            {showAvatar && !isMe ? (
                                                <Avatar className="h-8 w-8 border border-border">
                                                    <AvatarImage src={msg.profiles.avatar_url || undefined} />
                                                    <AvatarFallback>{msg.profiles.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                            ) : <div className="w-8" />}
                                        </div>

                                        <div className={cn(
                                            "flex flex-col max-w-[70%]",
                                            isMe ? "items-end" : "items-start"
                                        )}>
                                            {showAvatar && !isMe && (
                                                <span className="text-xs text-muted-foreground ml-1 mb-1">
                                                    {msg.profiles.full_name}
                                                </span>
                                            )}

                                            <div className={cn(
                                                "px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                                    : "bg-background border border-border text-foreground rounded-2xl rounded-tl-sm"
                                            )}>
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
                                                                <div key={idx} className="relative h-40 w-40 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity" onClick={handleOpen}>
                                                                    <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <div key={idx} onClick={handleOpen} className="flex items-center gap-2 p-2 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                                                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium truncate max-w-[150px] text-foreground">{fileName}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {/* Reactions Display */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className={cn(
                                                    "flex items-center gap-1 mt-1",
                                                    isMe ? "flex-row-reverse" : ""
                                                )}>
                                                    {Object.entries(msg.reactions?.reduce((acc: any, r: any) => {
                                                        acc[r.emoji] = (acc[r.emoji] || 0) + 1
                                                        return acc
                                                    }, {}) || {}).map(([emoji, count]: any) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(msg.id, emoji)}
                                                            className={cn(
                                                                "text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors",
                                                                msg.reactions?.some((r: any) => r.emoji === emoji && r.user_id === currentUserId)
                                                                    ? "bg-primary/10 border-primary/20 text-primary"
                                                                    : "bg-background border-border text-muted-foreground hover:bg-secondary"
                                                            )}
                                                        >
                                                            <span>{emoji}</span>
                                                            {Number(count) > 1 && <span className="font-bold">{String(count)}</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Actions */}
                                        <div className={cn(
                                            "opacity-0 group-hover/msg:opacity-100 transition-opacity absolute top-0 -mt-2",
                                            isMe ? "left-0 -ml-12" : "right-0 -mr-12"
                                        )}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground">
                                                        <SmilePlus className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                    <div className="flex gap-1 p-1">
                                                        {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded text-lg transition-colors"
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
                            )
                        })
                    )}

                    {/* Typing Indicator Bubble */}
                    {/* {otherUserTyping && ( */}
                    {/* <div className="flex gap-3 mt-2">
                            <div className="w-8 shrink-0" /> // Spacer for avatar alignment
                            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></span>
                            </div>
                        </div> */}
                    {/* )} */}
                    {/* Note: Disabling local typing indicator variable here as it was not in scope of previous component state, 
                        assuming you might need to add `otherUserTyping` to props if you want it back. 
                        Actually the previous code didn't have typing implemented inside the component logic above, 
                        so commenting it out to avoid reference error. */}

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <div className="max-w-4xl mx-auto space-y-3">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-md text-xs border border-border group relative">
                                    <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="truncate max-w-[150px] font-medium text-foreground">{file.name}</span>
                                    <button onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-secondary/50 p-2 rounded-xl border border-border focus-within:ring-1 focus-within:ring-ring transition-all">
                        <div className="flex gap-1 pb-1">
                            <label className="cursor-pointer p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                                <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                                <Paperclip className="h-5 w-5" />
                            </label>
                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full h-9 w-9 hover:bg-secondary">
                                <SmilePlus className="h-5 w-5" />
                            </Button>
                        </div>

                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-2 py-3 min-h-[44px] shadow-none placeholder:text-muted-foreground/50 text-foreground"
                        />

                        <div className="pb-1 pr-1">
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
                                className={cn(
                                    "rounded-full h-9 w-9 transition-all duration-200",
                                    (newMessage.trim() || attachments.length > 0)
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md w-10"
                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
