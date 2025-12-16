"use client"

import * as React from "react"
import { useState } from "react"
import { createCardsBulk } from "@/app/actions/flashcards"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BulkImportDialogProps {
    deckId: string
}

export function BulkImportDialog({ deckId }: BulkImportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [csvData, setCsvData] = useState("")
    const [preview, setPreview] = useState<Array<{ front: string; back: string; tags?: string[] }>>([])
    const router = useRouter()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            setCsvData(text)
            parseCSV(text)
        }
        reader.readAsText(file)
    }

    const parseCSV = (text: string) => {
        const lines = text.split("\n").filter((line) => line.trim().length > 0)
        const cards: Array<{ front: string; back: string; tags?: string[] }> = []

        // Skip header if present
        const startIndex = lines[0].toLowerCase().includes("front") ? 1 : 0

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i]
            // Simple CSV parsing (handles quotes)
            const matches = line.match(/("([^"]*)"|[^,]+)/g)
            if (!matches || matches.length < 2) continue

            const front = matches[0].replace(/^"|"$/g, "").trim()
            const back = matches[1].replace(/^"|"$/g, "").trim()
            const tagsStr = matches[2]?.replace(/^"|"$/g, "").trim()

            if (front && back) {
                cards.push({
                    front,
                    back,
                    tags: tagsStr ? tagsStr.split(";").map((t) => t.trim()) : undefined,
                })
            }
        }

        setPreview(cards)
    }

    const handleImport = async () => {
        if (preview.length === 0) {
            toast.error("No valid cards to import")
            return
        }

        setLoading(true)
        try {
            const { data, error } = await createCardsBulk(deckId, preview)

            if (error) {
                toast.error(error)
                return
            }

            toast.success(`Imported ${preview.length} cards!`)
            setOpen(false)
            setCsvData("")
            setPreview([])
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to import cards")
        } finally {
            setLoading(false)
        }
    }

    const downloadTemplate = () => {
        const template = `front,back,tags
"What is the capital of France?","Paris - the capital and largest city of France","geography;europe"
"Who wrote Romeo and Juliet?","William Shakespeare","literature;drama"
"What is H2O?","Water - a chemical compound consisting of hydrogen and oxygen","chemistry;science"`

        const blob = new Blob([template], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "flashcards_template.csv"
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Import
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Import Flashcards</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file or paste CSV data to import multiple flashcards at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Template Download */}
                    <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-2">CSV Format</p>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Use 3 columns: <code>front,back,tags</code>. Tags should be separated by
                                    semicolons.
                                </p>
                                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Download Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="csv-file">Upload CSV File</Label>
                        <input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                    </div>

                    {/* Or Paste CSV */}
                    <div className="space-y-2">
                        <Label htmlFor="csv-text">Or Paste CSV Data</Label>
                        <Textarea
                            id="csv-text"
                            placeholder="front,back,tags&#10;What is 2+2?,4,math&#10;Capital of France?,Paris,geography"
                            value={csvData}
                            onChange={(e) => {
                                setCsvData(e.target.value)
                                parseCSV(e.target.value)
                            }}
                            rows={6}
                            className="font-mono text-xs"
                        />
                    </div>

                    {/* Preview */}
                    {preview.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <Label>Preview ({preview.length} cards)</Label>
                            </div>
                            <div className="border border-border rounded-lg max-h-60 overflow-y-auto">
                                {preview.slice(0, 10).map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50"
                                    >
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Front:</span>
                                                <span className="line-clamp-2">{card.front}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Back:</span>
                                                <span className="line-clamp-2">{card.back}</span>
                                            </div>
                                        </div>
                                        {card.tags && card.tags.length > 0 && (
                                            <div className="mt-2 flex gap-1 flex-wrap">
                                                {card.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {preview.length > 10 && (
                                    <div className="p-3 text-center text-sm text-muted-foreground">
                                        +{preview.length - 10} more cards
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={loading || preview.length === 0}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            `Import ${preview.length} Cards`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
