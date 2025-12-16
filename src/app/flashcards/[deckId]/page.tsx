import { getDeck, getCardsInDeck, getDeckStats } from "@/app/actions/flashcards"
import { notFound } from "next/navigation"
import { DeckHeader } from "@/components/flashcards/deck-header"
import { CardsList } from "@/components/flashcards/cards-list"
import { AddCardDialog } from "@/components/flashcards/add-card-dialog"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DeckDetailPage({
    params,
}: {
    params: { deckId: string }
}) {
    const [deckResult, cardsResult, statsResult] = await Promise.all([
        getDeck(params.deckId),
        getCardsInDeck(params.deckId),
        getDeckStats(params.deckId),
    ])

    if (deckResult.error || !deckResult.data) {
        notFound()
    }

    const deck = deckResult.data
    const cards = cardsResult.data || []
    const stats = statsResult.data

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
