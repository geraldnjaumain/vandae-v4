import { redirect } from "next/navigation"
import { getDeck, getCardsInDeck, getDeckStats } from "@/app/actions/flashcards"
import { DeckHeader } from "@/components/flashcards/deck-header"
import { CardsList } from "@/components/flashcards/cards-list"
import { AddCardDialog } from "@/components/flashcards/add-card-dialog"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DeckDetailPage({
    params,
}: {
    params: { deckId: string }
}) {
    // Fetch all data in parallel
    const [deckResult, cardsResult, statsResult] = await Promise.all([
        getDeck(params.deckId),
        getCardsInDeck(params.deckId),
        getDeckStats(params.deckId),
    ])

    // Handle deck not found - redirect to flashcards page
    if (deckResult.error || !deckResult.data) {
        redirect("/flashcards")
    }

    const deck = deckResult.data
    const cards = cardsResult.data || []
    const stats = statsResult.data || {
        totalCards: 0,
        newCards: 0,
        dueCards: 0,
        reviewingCards: 0,
        retentionRate: 0,
    }

    // Handle errors gracefully with error UI
    if (cardsResult.error || statsResult.error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Deck Data</AlertTitle>
                    <AlertDescription>
                        There was a problem loading the deck information. Please try again later.
                        {cardsResult.error && <div className="mt-2 text-sm">Cards: {cardsResult.error}</div>}
                        {statsResult.error && <div className="mt-2 text-sm">Stats: {statsResult.error}</div>}
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link href="/flashcards">
                        <Button variant="outline">Back to Flashcards</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Deck Header */}
                <DeckHeader deck={deck} stats={stats} cardsCount={cards.length} />

                {/* Cards List */}
                <div className="mt-8">
                    <Suspense fallback={<Skeleton className="h-96" />}>
                        <CardsList deckId={deck.id} initialCards={cards} />
                    </Suspense>
                </div>
            </div>

            {/* Floating Add Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <AddCardDialog deckId={deck.id} />
            </div>
        </div>
    )
}
