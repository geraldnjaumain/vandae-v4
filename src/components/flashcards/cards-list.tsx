"use client"

import * as React from "react"
import { useState } from "react"
import { Flashcard, deleteCard } from "@/app/actions/flashcards"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Trash2,
    Edit,
    Eye,
    Search,
    Filter,
    SortAsc,
    MoreVertical,
    Calendar,
    Brain,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface CardsListProps {
    deckId: string
    initialCards: Flashcard[]
}

export function CardsList({ deckId, initialCards }: CardsListProps) {
    const [cards, setCards] = useState(initialCards)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterTab, setFilterTab] = useState<"all" | "new" | "due" | "learning">("all")
    const router = useRouter()

    const handleDelete = async (cardId: string) => {
        if (!confirm("Are you sure you want to delete this card?")) {
            return
        }

        const { error } = await deleteCard(cardId)
        if (error) {
            toast.error(error)
            return
        }

        toast.success("Card deleted")
        setCards(cards.filter((c) => c.id !== cardId))
    }

    // Filter cards based on search and tab
    const filteredCards = cards.filter((card) => {
        // Search filter
        const matchesSearch =
            searchQuery.trim() === "" ||
            card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        // Tab filter
        const matchesTab =
            filterTab === "all" ||
            (filterTab === "new" && card.card_state === "new") ||
            (filterTab === "due" && card.next_review_date && new Date(card.next_review_date) <= new Date()) ||
            (filterTab === "learning" && (card.card_state === "learning" || card.card_state === "relearning"))

        return matchesSearch && matchesTab
    })

    const getStateColor = (state: Flashcard["card_state"]) => {
        switch (state) {
            case "new":
                return "bg-blue-500"
            case "learning":
                return "bg-orange-500"
            case "reviewing":
                return "bg-green-500"
            case "relearning":
                return "bg-yellow-500"
            default:
                return "bg-gray-500"
        }
    }

    const getStateBadge = (state: Flashcard["card_state"]) => {
        switch (state) {
            case "new":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">New</Badge>
            case "learning":
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Learning</Badge>
            case "reviewing":
                return <Badge variant="outline" className="bg-green-500/10 text-green-500">Reviewing</Badge>
            case "relearning":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Relearning</Badge>
        }
    }

    // Empty state
    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                    <Brain className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No cards yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Add your first flashcard to start studying, or use AI to generate cards from your notes and PDFs.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search cards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="w-full md:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All ({cards.length})</TabsTrigger>
                        <TabsTrigger value="new">
                            New ({cards.filter((c) => c.card_state === "new").length})
                        </TabsTrigger>
                        <TabsTrigger value="due">
                            Due (
                            {
                                cards.filter((c) => c.next_review_date && new Date(c.next_review_date) <= new Date())
                                    .length
                            }
                            )
                        </TabsTrigger>
                        <TabsTrigger value="learning">
                            Learning (
                            {cards.filter((c) => c.card_state === "learning" || c.card_state === "relearning").length}
                            )
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Cards Grid */}
            {filteredCards.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No cards match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCards.map((card) => (
                        <Card key={card.id} className="group hover:shadow-lg transition-all">
                            <CardContent className="p-5">
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-3">
                                    {getStateBadge(card.card_state)}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Card
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(card.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Card Content */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Front:</p>
                                        <p className="text-sm font-medium text-foreground line-clamp-2">
                                            {card.front}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Back:</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{card.back}</p>
                                    </div>
                                </div>

                                {/* Tags */}
                                {card.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {card.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {card.tags.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{card.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-3 w-3" />
                                        <span>{card.times_reviewed} reviews</span>
                                    </div>
                                    {card.next_review_date && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {new Date(card.next_review_date) > new Date()
                                                    ? formatDistanceToNow(new Date(card.next_review_date), {
                                                        addSuffix: true,
                                                    })
                                                    : "Due now"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
