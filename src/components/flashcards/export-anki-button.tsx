"use client"

import * as React from "react"
import { useState } from "react"
import { getCardsInDeck, getDeck } from "@/app/actions/flashcards"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportButtonProps {
    deckId: string
}

export function ExportToAnkiButton({ deckId }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            // Fetch deck and cards
            const [deckResult, cardsResult] = await Promise.all([
                getDeck(deckId),
                getCardsInDeck(deckId, "all"),
            ])

            if (deckResult.error || !deckResult.data) {
                toast.error("Failed to fetch deck")
                return
            }

            if (cardsResult.error || !cardsResult.data) {
                toast.error("Failed to fetch cards")
                return
            }

            const deck = deckResult.data
            const cards = cardsResult.data

            if (cards.length === 0) {
                toast.error("No cards to export")
                return
            }

            // Generate TSV format (Anki compatible)
            // Format: front\tback\ttags
            let tsvContent = ""

            for (const card of cards) {
                const front = escapeAnki(card.front)
                const back = escapeAnki(card.back)
                const tags = card.tags.join(" ")

                tsvContent += `${front}\t${back}\t${tags}\n`
            }

            // Create and download file
            const blob = new Blob([tsvContent], { type: "text/tab-separated-values" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${sanitizeFilename(deck.name)}_anki_export.txt`
            a.click()
            URL.revokeObjectURL(url)

            toast.success(`Exported ${cards.length} cards to Anki format`)
        } catch (error) {
            console.error(error)
            toast.error("Failed to export to Anki")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading}
            className="gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Export to Anki
                </>
            )}
        </Button>
    )
}

// Helper functions
function escapeAnki(text: string): string {
    // Replace newlines with <br> for Anki
    return text.replace(/\n/g, "<br>").replace(/\t/g, " ")
}

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
}
