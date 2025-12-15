"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Save,
    FileText,
    Loader2,
    Search,
    BookOpen,
    Wand2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AssignmentEditorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: {
        title: string
        description: string
        dueDate: string
        priority: string
    }
    onSave: () => void
}

export function AssignmentEditor({ open, onOpenChange, initialData, onSave }: AssignmentEditorProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [content, setContent] = useState(initialData?.description || "")
    const [isAiThinking, setIsAiThinking] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [showResearch, setShowResearch] = useState(false)
    const contentRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const words = content.trim().split(/\s+/).filter(w => w.length > 0)
        setWordCount(words.length)
    }, [content])

    const handleAiSuggestion = async (prompt: string) => {
        setIsAiThinking(true)
        // Simulate AI call
        setTimeout(() => {
            const suggestions = {
                "improve": "\n\nAI Suggestion: Consider expanding on key points and adding supporting evidence...",
                "grammar": "\n\n[Grammar check complete - No major issues found]",
                "outline": "\n\n## Outline\n1. Introduction\n2. Main Body\n   - Point A\n   - Point B\n3. Conclusion"
            }
            setContent(prev => prev + (suggestions[prompt as keyof typeof suggestions] || ""))
            setIsAiThinking(false)
            toast.success("AI suggestion added!")
        }, 2000)
    }

    const formatText = (action: string) => {
        const textarea = contentRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end)

        let formattedText = selectedText
        switch (action) {
            case 'bold':
                formattedText = `**${selectedText}**`
                break
            case 'italic':
                formattedText = `*${selectedText}*`
                break
            case 'heading1':
                formattedText = `# ${selectedText}`
                break
            case 'heading2':
                formattedText = `## ${selectedText}`
                break
            case 'list':
                formattedText = `- ${selectedText}`
                break
            case 'quote':
                formattedText = `> ${selectedText}`
                break
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end)
        setContent(newContent)
    }

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Please enter a title")
            return
        }
        onSave()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-border">
                    <DialogTitle className="sr-only">Assignment Editor</DialogTitle>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Assignment Title..."
                                className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {wordCount} words
                            </Badge>
                            <Button onClick={handleSave} size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Toolbar */}
                        <div className="px-6 py-2 border-b border-border bg-muted/30 flex items-center gap-1 overflow-x-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('bold')}
                                className="h-8 w-8 p-0"
                            >
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('italic')}
                                className="h-8 w-8 p-0"
                            >
                                <Italic className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('heading1')}
                                className="h-8 w-8 p-0"
                            >
                                <Heading1 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('heading2')}
                                className="h-8 w-8 p-0"
                            >
                                <Heading2 className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText('quote')}
                                className="h-8 w-8 p-0"
                            >
                                <Quote className="h-4 w-4" />
                            </Button>
                            <div className="flex-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResearch(!showResearch)}
                                className={cn("h-8 gap-2", showResearch && "bg-accent")}
                            >
                                <BookOpen className="h-4 w-4" />
                                Research
                            </Button>
                        </div>

                        {/* Content Area */}
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <Textarea
                                    ref={contentRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Start writing your assignment... Use markdown for formatting."
                                    className="min-h-[600px] border-none shadow-none focus-visible:ring-0 resize-none text-base leading-relaxed"
                                />
                            </div>
                        </ScrollArea>

                        {/* AI Assistant Bar */}
                        <div className="px-6 py-3 border-t border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-muted-foreground">AI Assistant:</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAiSuggestion('improve')}
                                    disabled={isAiThinking}
                                    className="h-7"
                                >
                                    {isAiThinking ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Wand2 className="h-3 w-3 mr-1" />
                                    )}
                                    Improve
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAiSuggestion('grammar')}
                                    disabled={isAiThinking}
                                    className="h-7"
                                >
                                    Check Grammar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAiSuggestion('outline')}
                                    disabled={isAiThinking}
                                    className="h-7"
                                >
                                    Generate Outline
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Research Panel */}
                    {showResearch && (
                        <div className="w-80 border-l border-border bg-card">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Quick Research
                                </h3>
                                <Input placeholder="Search for sources..." className="h-9" />
                            </div>
                            <ScrollArea className="h-[calc(100%-80px)]">
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                                            <h4 className="text-sm font-medium text-foreground mb-1">
                                                Sample Research Source {i}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                Relevant information about your topic...
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">Article</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
