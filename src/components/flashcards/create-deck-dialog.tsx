"use client"

import * as React from "react"
import { useState } from "react"
import { createDeck } from "@/app/actions/flashcards"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateDeckDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [color, setColor] = useState("#3b82f6")
    const router = useRouter()

    const colors = [
        { value: "#3b82f6", label: "Blue" },
        { value: "#10b981", label: "Green" },
        { value: "#f59e0b", label: "Orange" },
        { value: "#ef4444", label: "Red" },
        { value: "#8b5cf6", label: "Purple" },
        { value: "#ec4899", label: "Pink" },
    ]

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Please enter a deck name")
            return
        }

        setLoading(true)
        try {
            const { data, error } = await createDeck({
                name: name.trim(),
                description: description.trim() || undefined,
                color,
            })

            if (error) {
                toast.error(error)
                return
            }

            toast.success("Deck created successfully!")
            setOpen(false)
            setName("")
            setDescription("")
            setColor("#3b82f6")

            // Navigate to new deck
            if (data) {
                router.push(`/flashcards/${data.id}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to create deck")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    New Deck
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Flashcard Deck</DialogTitle>
                    <DialogDescription>
                        Organize your flashcards by topic, course, or any way you like
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Deck Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Biology Chapter 5"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What will you study in this deck?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <Label>Deck Color</Label>
                        <div className="flex gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setColor(c.value)}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${color === c.value ? "border-foreground ring-2 ring-offset-2" : "border-border"
                                        }`}
                                    style={{ backgroundColor: c.value }}
                                    aria-label={c.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={loading || !name.trim()}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Deck"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
