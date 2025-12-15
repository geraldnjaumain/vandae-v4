"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"
import { StickyNote } from "lucide-react"

export function QuickNotesCard() {
    const [notes, setNotes] = React.useState("")
    const [isSaving, setIsSaving] = React.useState(false)
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null)

    // Load notes from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem("vadea-quick-notes")
        if (saved) {
            setNotes(saved)
        }
    }, [])

    // Auto-save to localStorage with debounce
    React.useEffect(() => {
        if (notes === "") return

        setIsSaving(true)
        const timeout = setTimeout(() => {
            localStorage.setItem("vadea-quick-notes", notes)
            setLastSaved(new Date())
            setIsSaving(false)
        }, 1000)

        return () => clearTimeout(timeout)
    }, [notes])

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Quick Notes
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                    <span>Jot down anything</span>
                    {isSaving && (
                        <span className="text-xs text-slate-500">Saving...</span>
                    )}
                    {!isSaving && lastSaved && (
                        <span className="text-xs text-slate-500">
                            Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type your notes here... (auto-saved to browser)"
                    className="flex-1 w-full resize-none border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-muted-foreground bg-background"
                    style={{ minHeight: '200px' }}
                />
            </CardContent>
        </Card>
    )
}
