"use client"

import * as React from "react"
import Link from "next/link"
import { FlashcardDeck } from "@/app/actions/flashcards"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Play, TrendingUp, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DeckListProps {
    decks: (FlashcardDeck & {
        stats?: {
            total_cards: number
            new_cards: number
            due_cards: number
            mature_cards: number
            avg_ease_factor: number
            retention_rate: number
        }
    })[]
}

export function DeckList({ decks }: DeckListProps) {
    if (decks.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
                <Link key={deck.id} href={`/flashcards/${deck.id}`}>
                    <Card
                        className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-l-4"
                        style={{ borderLeftColor: deck.color }}
                    >
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                        {deck.icon} {deck.name}
                                    </h3>
                                    {deck.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {deck.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-muted rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Brain className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {deck.stats?.total_cards || 0}
                                    </p>
                                </div>

                                <div className="bg-muted rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Due</p>
                                    </div>
                                    <p className="text-2xl font-bold text-secondary">
                                        {deck.stats?.due_cards || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Retention Rate */}
                            {deck.stats && deck.stats.total_cards > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">Retention Rate</span>
                                        <span className="text-xs font-semibold text-foreground">
                                            {Math.round(deck.stats.retention_rate || 0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                                            style={{ width: `${Math.round(deck.stats.retention_rate || 0)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(deck.updated_at), { addSuffix: true })}
                                </span>
                                {(deck.stats?.due_cards || 0) > 0 && (
                                    <Button
                                        size="sm"
                                        className="gap-1"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            window.location.href = `/flashcards/${deck.id}/review`
                                        }}
                                    >
                                        <Play className="h-3 w-3" />
                                        Review
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
