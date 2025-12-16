"use client"

import * as React from "react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bold,
    Italic,
    Code,
    List,
    ListOrdered,
    Link2,
    Eye,
    EyeOff,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    minRows?: number
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    label,
    minRows = 4,
}: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const insertMarkdown = (before: string, after = "") => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText =
            value.substring(0, start) + before + selectedText + after + value.substring(end)

        onChange(newText)

        // Restore cursor position
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length
            )
        }, 0)
    }

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium">{label}</label>}

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border border-border rounded-t-lg bg-muted/50">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("**", "**")}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("*", "*")}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("`", "`")}
                    title="Code"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("- ")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("1. ")}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown("[", "](url)")}
                    title="Link"
                >
                    <Link2 className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-2"
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? (
                        <>
                            <EyeOff className="h-4 w-4" />
                            <span className="text-xs">Edit</span>
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">Preview</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Editor/Preview */}
            {showPreview ? (
                <div className="border border-t-0 border-border rounded-b-lg p-4 min-h-[100px] bg-background prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{value || "*Nothing to preview*"}</ReactMarkdown>
                </div>
            ) : (
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={minRows}
                    className="resize-none border-t-0 rounded-t-none focus-visible:ring-0"
                />
            )}

            <p className="text-xs text-muted-foreground">
                Supports markdown formatting for rich text
            </p>
        </div>
    )
}
