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
import { toggleReaction } from "@/app/reactions/actions"
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
    channel_id: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
    reactions?: { id: string, user_id: string, emoji: string }[]
}

interface ChatInterfaceProps {
    communityId: string
    channelId: string
    channelName: string
    currentUserId: string
}

export function ChatInterface({ communityId, channelId, channelName, currentUserId }: ChatInterfaceProps) {
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
                const existingReaction = msg.reactions?.find(r => r.user_id === currentUserId && r.emoji === emoji)
                if (existingReaction) {
                    // Remove
                    return {
                        ...msg,
                        reactions: msg.reactions?.filter(r => r.id !== existingReaction.id)
                    }
                } else {
                    // Add
                    return {
                        ...msg,
                        reactions: [...(msg.reactions || []), { id: `temp-${Date.now()}`, user_id: currentUserId, emoji }]
                    }
                }
            }
            return msg
        }))

        try {
            await toggleReaction(messageId, emoji)
        } catch (error) {
            console.error('Error toggling reaction:', error)
            toast.error('Failed to update reaction')
        }
    }

    React.useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select(`
                            id,
                            content,
                            author_id,
                            created_at,
                            attachments,
                            profiles:author_id (
                                full_name,
                                avatar_url
                            ),
                            reactions:message_reactions (
                                id,
                                user_id,
                                emoji
                            )
                        `)
                    .eq('channel_id', channelId)
                    .order('created_at', { ascending: true })

                if (error) throw error

                if (data) {
                    setMessages(data as any as Message[])
                    setTimeout(() => {
                        if (scrollRef.current) {
                            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                        }
                    }, 100)
                }
            } catch (error) {
                console.error('Error fetching messages:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMessages()

        // Realtime subscription
        const channel = supabase
            .channel(`chat:${channelId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel_id=eq.${channelId}`
                },
                async (payload) => {
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
                    // Scroll to bottom
                    if (scrollRef.current) {
                        scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'message_reactions' },
                (payload) => {
                    const newReaction = payload.new as { id: string, message_id: string, user_id: string, emoji: string }
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === newReaction.message_id) {
                            const exists = msg.reactions?.some((r: any) => r.user_id === newReaction.user_id && r.emoji === newReaction.emoji)
                            if (exists) {
                                return {
                                    ...msg,
                                    reactions: msg.reactions?.map((r: any) =>
                                        (r.user_id === newReaction.user_id && r.emoji === newReaction.emoji) ? { ...r, id: newReaction.id } : r
                                    )
                                }
                            }
                            return {
                                ...msg,
                                reactions: [...(msg.reactions || []), { id: newReaction.id, user_id: newReaction.user_id, emoji: newReaction.emoji }]
                            }
                        }
                        return msg
                    }))
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'message_reactions' },
                (payload) => {
                    const oldReaction = payload.old as { id: string }
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        reactions: msg.reactions?.filter((r: any) => r.id !== oldReaction.id) || []
                    })))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelId, supabase])

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
                    const fileName = `${currentUserId}/${Date.now()}-${file.name}`

                    const { error: uploadError } = await supabase.storage
                        .from('vault')
                        .upload(fileName, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('vault')
                        .getPublicUrl(fileName)

                    uploadedUrls.push(publicUrl)
                }
            }

            const { error } = await supabase
                .from('messages')
                .insert({
                    channel_id: channelId,
                    content: newMessage,
                    author_id: currentUserId,
                    attachments: uploadedUrls
                })

            if (error) throw error

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
                                <div key={msg.id} className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'} group`}>
                                    <div className="w-10 shrink-0">
                                        {showAvatar ? (
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={msg.profiles.avatar_url || undefined} />
                                                <AvatarFallback>{msg.profiles.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                        ) : <div className="w-10" />}
                                    </div>

                                    <div className="flex-1 min-w-0 group/msg relative">
                                        {showAvatar && (
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-slate-900">
                                                    {msg.profiles.full_name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {format(new Date(msg.created_at), 'p')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
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

                                        {/* Reactions */}
                                        <div className="flex items-center gap-1 mt-1">
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

                                            <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                                                            <SmilePlus className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        <div className="flex gap-1 p-1">
                                                            {['Like', 'Love', 'Laugh', 'Wow', 'Sad', 'Fire'].map(reaction => (
                                                                <button
                                                                    key={reaction}
                                                                    className="px-2 py-1 flex items-center justify-center hover:bg-slate-100 rounded text-xs font-medium"
                                                                    onClick={() => handleReaction(msg.id, reaction)}
                                                                >
                                                                    {reaction}
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
                            placeholder={`Message #${channelName}`}
                            className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[40px]"
                        />
                        <Button type="submit" size="icon" disabled={isSending || (!newMessage.trim() && attachments.length === 0)} className="rounded-full flex-shrink-0">
                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
