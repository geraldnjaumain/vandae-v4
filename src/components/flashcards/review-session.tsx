"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    startReviewSession,
    completeReviewSession,
} from "@/app/actions/flashcards"
import { ReviewCard } from "@/components/flashcards/review-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, Brain, TrendingUp, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ReviewSessionProps {
    deckId: string
    deckName: string
}

export function ReviewSession({ deckId, deckName }: ReviewSessionProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [session, setSession] = useState<any>(null)
    const [cards, setCards] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [stats, setStats] = useState<any>(null)

    const router = useRouter()

    useEffect(() => {
        loadSession()
    }, [deckId])

    const loadSession = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: sessionError } = await startReviewSession(deckId)

            if (sessionError) {
                setError(sessionError)
                setLoading(false)
                return
            }

            if (data) {
                setSession(data.session)
                setCards(data.cards)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to start review session")
        } finally {
            setLoading(false)
        }
    }

    const handleCardComplete = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            finishSession()
        }
    }

    const finishSession = async () => {
        if (!session) return

        try {
            const { data } = await completeReviewSession(session.id)
            if (data) {
                setStats(data)
                setCompleted(true)
            }
        } catch (error) {
            console.error(error)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Starting review session...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="max-w-md text-center">
                    <div className="bg-muted rounded-full p-6 mb-6 inline-block">
                        <Brain className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">No Cards to Review</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button asChild>
                        <Link href={`/flashcards/${deckId}`}>Back to Deck</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Completion state
    if (completed && stats) {
        const accuracy =
            stats.cards_reviewed > 0
                ? Math.round((stats.cards_correct / stats.cards_reviewed) * 100)
                : 0

        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="bg-green-500/10 rounded-full p-6 mb-6 inline-block">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h2>
                        <p className="text-muted-foreground">Great job reviewing {deckName}</p>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Cards Reviewed */}
                                <div className="text-center">
                                    <div className="bg-primary/10 rounded-full p-4 mb-3 inline-block">
                                        <Brain className="h-8 w-8 text-primary" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        {stats.cards_reviewed}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Cards Reviewed</p>
                                </div>

                                {/* Accuracy */}
                                <div className="text-center">
                                    <div className="bg-green-500/10 rounded-full p-4 mb-3 inline-block">
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">{accuracy}%</p>
                                    <p className="text-sm text-muted-foreground">Accuracy</p>
                                </div>

                                {/* Time Spent */}
                                <div className="text-center">
                                    <div className="bg-secondary/10 rounded-full p-4 mb-3 inline-block">
                                        <Clock className="h-8 w-8 text-secondary" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        {Math.round(stats.session_duration / 60)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Minutes</p>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="border-t border-border mt-6 pt-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Correct (Good/Easy)</span>
                                    <span className="font-semibold text-foreground">{stats.cards_correct}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Needs Review (Again)</span>
                                    <span className="font-semibold text-foreground">{stats.cards_failed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4 mt-8 justify-center">
                        <Button variant="outline" asChild>
                            <Link href={`/flashcards/${deckId}`}>Back to Deck</Link>
                        </Button>
                        <Button onClick={() => window.location.reload()}>Review Again</Button>
                    </div>
                </div>
            </div>
        )
    }

    // Review in progress
    if (!cards || cards.length === 0 || !session) {
        return null
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <ReviewCard
                card={cards[currentIndex]}
                sessionId={session.id}
                currentIndex={currentIndex}
                totalCards={cards.length}
                onComplete={handleCardComplete}
            />
        </div>
    )
}
