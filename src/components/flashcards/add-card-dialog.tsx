"use client"

import * as React from "react"
import { useState } from "react"
import { createCard } from "@/app/actions/flashcards"
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
import { Plus, Loader2, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddCardDialogProps {
    deckId: string
}

export function AddCardDialog({ deckId }: AddCardDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [front, setFront] = useState("")
    const [back, setBack] = useState("")
    const [tags, setTags] = useState("")
    const router = useRouter()

    const handleCreate = async () => {
        if (!front.trim() || !back.trim()) {
            toast.error("Please fill in both front and back of the card")
            return
        }

        setLoading(true)
        try {
            const tagArray = tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0)

            const { data, error } = await createCard({
                deckId,
                front: front.trim(),
                back: back.trim(),
                tags: tagArray.length > 0 ? tagArray : undefined,
            })

            if (error) {
                toast.error(error)
                return
            }

            toast.success("Card created!")
            setOpen(false)
            setFront("")
            setBack("")
            setTags("")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create card")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg rounded-full h-14 px-6">
                    <Plus className="h-5 w-5" />
                    Add Card
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Flashcard</DialogTitle>
                    <DialogDescription>
                        Create a new flashcard by filling in the front (question) and back (answer).
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="ai">
                            <Wand2 className="mr-2 h-4 w-4" />
                            AI Generate
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4 py-4">
                        {/* Front */}
                        <div className="space-y-2">
                            <Label htmlFor="front">Front (Question)</Label>
                            <Textarea
                                id="front"
                                placeholder="What is the capital of France?"
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be shown first during review
                            </p>
                        </div>

                        {/* Back */}
                        <div className="space-y-2">
                            <Label htmlFor="back">Back (Answer)</Label>
                            <Textarea
                                id="back"
                                placeholder="Paris - the capital and largest city of France, known for the Eiffel Tower..."
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a detailed answer with examples if possible
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Optional)</Label>
                            <Input
                                id="tags"
                                placeholder="geography, europe, capitals"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple tags with commas
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={loading || !front.trim() || !back.trim()}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Card"
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="ai" className="py-4">
                        <div className="text-center py-8">
                            <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">AI Card Generation</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Generate flashcards from your notes, PDFs, or course materials using AI.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This feature will be available soon. For now, you can use the manual entry.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
