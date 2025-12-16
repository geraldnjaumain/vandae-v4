import { Suspense } from "react"
import { getDecks } from "@/app/actions/flashcards"
import { DeckList } from "@/components/flashcards/deck-list"
import { Button } from "@/components/ui/button"
import { Plus, Brain, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CreateDeckDialog } from "@/components/flashcards/create-deck-dialog"

export default async function FlashcardsPage() {
    const { data: decks, error } = await getDecks()

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                            <Brain className="h-10 w-10 text-primary" />
                            Flashcards
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Master your courses with spaced repetition
                        </p>
                    </div>
                    <CreateDeckDialog />
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
                        <p className="font-semibold">Error loading decks</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!error && (!decks || decks.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-muted rounded-full p-6 mb-6">
                            <Brain className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            No flashcard decks yet
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Create your first deck to start learning with spaced repetition. Use AI to
                            generate flashcards from your notes, PDFs, or course materials.
                        </p>
                        <CreateDeckDialog />
                    </div>
                )}

                {/* Decks Grid */}
                {decks && decks.length > 0 && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-lg p-3">
                                        <Brain className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{decks.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Decks</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-secondary/10 rounded-lg p-3">
                                        <TrendingUp className="h-6 w-6 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {decks.reduce((sum, deck) => sum + (deck.stats?.total_cards || 0), 0)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Total Cards</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent/10 rounded-lg p-3">
                                        <Brain className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {decks.reduce((sum, deck) => sum + (deck.stats?.due_cards || 0), 0)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Cards Due</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deck List */}
                        <Suspense fallback={<div>Loading decks...</div>}>
                            <DeckList decks={decks} />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    )
}
