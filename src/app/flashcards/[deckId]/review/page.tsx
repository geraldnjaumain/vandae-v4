import { ReviewSession } from "@/components/flashcards/review-session"
import { getDeck } from "@/app/actions/flashcards"
import { notFound } from "next/navigation"

export default async function ReviewPage({
    params,
}: {
    params: { deckId: string }
}) {
    const { data: deck, error } = await getDeck(params.deckId)

    if (error || !deck) {
        notFound()
    }

    return <ReviewSession deckId={deck.id} deckName={deck.name} />
}
