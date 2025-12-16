"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface DueDeck {
    id: string
    name: string
    color: string
    due_cards: number
}

export function FlashcardsDueWidget() {
    const [loading, setLoading] = useState(true)
    const [dueDecks, setDueDecks] = useState<DueDeck[]>([])
    const [totalDue, setTotalDue] = useState(0)

    useEffect(() => {
        fetchDueCards()
    }, [])

    const fetchDueCards = async () => {
        try {
            const response = await fetch("/api/flashcards/due")
            const data = await response.json()

            if (data.decks) {
                setDueDecks(data.decks)
                setTotalDue(data.total)
            }
        } catch (error) {
            console.error("Failed to fetch due cards:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Flashcards Due
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (totalDue === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Flashcards Due
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            No cards due for review right now
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/flashcards">View Decks</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Flashcards Due
                    </div>
                    <Badge variant="secondary" className="text-lg">
                        {totalDue}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {dueDecks.slice(0, 5).map((deck) => (
                    <Link
                        key={deck.id}
                        href={`/flashcards/${deck.id}/review`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-1 h-8 rounded-full"
                                style={{ backgroundColor: deck.color }}
                            />
                            <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                {deck.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{deck.due_cards}</Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </Link>
                ))}

                {dueDecks.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/flashcards">
                            View All Decks ({dueDecks.length - 5} more)
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
