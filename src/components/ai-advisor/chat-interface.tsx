"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Loader2, GraduationCap, X, FileText, Paperclip, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
    role: 'user' | 'assistant'
    content: string
    timestamp?: Date
}

const starterPrompts = [
    "Plan my study schedule for this week",
    "Tips for writing a research paper",
    "How to manage exam stress?",
    "Explain the Feynman technique"
]

interface ChatInterfaceProps {
    className?: string
    userName?: string
}

export function ChatInterface({ className, userName = "Student" }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (content?: string) => {
        const messageContent = content || input.trim()
        if (!messageContent || isLoading) return

        const userMessage: Message = {
            role: 'user',
            content: messageContent,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    userName
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to get response')
            }

            const data = await response.json()

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error: any) {
            console.error('Chat error:', error)
            toast.error(error.message || 'Failed to get AI response')

            // Add error message
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 md:px-6 py-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center mb-6">
                            <GraduationCap className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Welcome back, {userName}!
                        </h2>
                        <p className="text-muted-foreground mb-8 text-center max-w-md">
                            I'm your AI study companion. Ask me anything about your courses, assignments, or study strategies.
                        </p>

                        {/* Starter Prompts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                            {starterPrompts.map((prompt, idx) => (
                                <Card
                                    key={idx}
                                    className="p-4 cursor-pointer hover:bg-accent/10 transition-all duration-200 border-2 hover:border-primary group"
                                    onClick={() => handleSend(prompt)}
                                >
                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                                            {prompt}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-4",
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                        <GraduationCap className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-3 max-w-[80%]",
                                        message.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border"
                                    )}
                                >
                                    <div className={cn(
                                        "prose prose-sm max-w-none",
                                        message.role === 'user'
                                            ? "prose-invert"
                                            : "prose-slate dark:prose-invert"
                                    )}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {message.timestamp && (
                                        <p className={cn(
                                            "text-xs mt-2",
                                            message.role === 'user'
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                        )}>
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>

                                {message.role === 'user' && (
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border bg-card px-4 md:px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your studies..."
                                disabled={isLoading}
                                className="pr-12 min-h-[48px] resize-none"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 bottom-1 h-8 w-8"
                                disabled
                            >
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            size="lg"
                            className="h-12 px-6"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        AI responses may contain errors. Always verify important information.
                    </p>
                </div>
            </div>
        </div>
    )
}
