"use client"

import { FlashcardDeck } from "@/app/actions/flashcards"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Play,
    Settings,
    ArrowLeft,
    TrendingUp,
    Brain,
    Calendar,
    BarChart
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DeckHeaderProps {
    deck: FlashcardDeck
    stats?: {
        total_cards: number
        new_cards: number
        due_cards: number
        mature_cards: number
        avg_ease_factor: number
        retention_rate: number
    }
    cardsCount: number
}

export function DeckHeader({ deck, stats, cardsCount }: DeckHeaderProps) {
    const router = useRouter()

    const handleStartReview = () => {
        router.push(`/flashcards/${deck.id}/review`)
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="gap-2">
                <Link href="/flashcards">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Decks
                </Link>
            </Button>

            {/* Deck Info Card */}
            <Card style={{ borderLeftColor: deck.color, borderLeftWidth: 4 }}>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Left: Deck Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {deck.icon && <span className="text-3xl">{deck.icon}</span>}
                                <h1 className="text-3xl font-bold text-foreground">{deck.name}</h1>
                            </div>
                            {deck.description && (
                                <p className="text-muted-foreground mb-4">{deck.description}</p>
                            )}

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {stats?.total_cards || cardsCount} cards
                                    </span>
                                </div>
                                {stats && stats.due_cards > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-secondary" />
                                        <span className="text-sm font-semibold text-secondary">
                                            {stats.due_cards} due
                                        </span>
                                    </div>
                                )}
                                {stats && stats.new_cards > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {stats.new_cards} new
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col gap-3">
                            {stats && stats.due_cards > 0 && (
                                <Button size="lg" onClick={handleStartReview} className="gap-2">
                                    <Play className="h-5 w-5" />
                                    Start Review
                                    <Badge variant="secondary" className="ml-2">
                                        {stats.due_cards}
                                    </Badge>
                                </Button>
                            )}
                            <Button variant="outline" size="lg" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Deck Settings
                            </Button>
                        </div>
                    </div>

                    {/* Retention Rate Bar */}
                    {stats && stats.total_cards > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Retention Rate</span>
                                </div>
                                <span className="text-lg font-bold text-foreground">
                                    {Math.round(stats.retention_rate || 0)}%
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                    style={{ width: `${Math.round(stats.retention_rate || 0)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                                {stats.new_cards}
                            </div>
                            <div className="text-xs text-muted-foreground">New Cards</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                                {stats.mature_cards}
                            </div>
                            <div className="text-xs text-muted-foreground">Mature Cards</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                                {stats.avg_ease_factor.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Ease</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                                {stats.total_cards - stats.new_cards}
                            </div>
                            <div className="text-xs text-muted-foreground">Reviewed</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
