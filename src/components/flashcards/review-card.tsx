"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Flashcard } from "@/app/actions/flashcards"
import { submitCardReview, ReviewRating } from "@/app/actions/flashcards"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReviewCardProps {
    card: Flashcard
    sessionId: string
    currentIndex: number
    totalCards: number
    onComplete: () => void
}

export function ReviewCard({
    card,
    sessionId,
    currentIndex,
    totalCards,
    onComplete,
}: ReviewCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [startTime] = useState(Date.now())

    const router = useRouter()

    // Reset flip state when card changes
    useEffect(() => {
        setIsFlipped(false)
    }, [card.id])

    const handleRate = async (rating: ReviewRating) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000)

        setSubmitting(true)
        try {
            const { data, error } = await submitCardReview(card.id, sessionId, rating, timeTaken)

            if (error) {
                toast.error(error)
                setSubmitting(false)
                return
            }

            // Show feedback
            const ratingLabels = {
                1: "Again",
                2: "Hard",
                3: "Good",
                4: "Easy",
            }
            toast.success(`Rated ${ratingLabels[rating]} - Next review in ${data?.newInterval} days`)

            // Move to next card
            onComplete()
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit review")
            setSubmitting(false)
        }
    }

    const progress = ((currentIndex + 1) / totalCards) * 100

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
            {/* Progress */}
            <div className="w-full max-w-2xl mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                        Card {currentIndex + 1} of {totalCards}
                    </span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Flashcard */}
            <div
                className="relative w-full max-w-2xl mb-8 cursor-pointer"
                onClick={() => !isFlipped && setIsFlipped(true)}
                style={{ perspective: "1000px" }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFlipped ? "back" : "front"}
                        initial={{ rotateY: isFlipped ? -180 : 0 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: isFlipped ? 180 : -180 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        style={{
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                        }}
                    >
                        <Card className="relative min-h-[400px] p-8 flex items-center justify-center bg-card border-2 border-border shadow-xl">
                            <div className="text-center w-full">
                                {!isFlipped ? (
                                    <>
                                        {/* Front */}
                                        <div className="mb-4">
                                            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                                Question
                                            </span>
                                        </div>
                                        {card.front_media_url && (
                                            <div className="mb-6">
                                                <img
                                                    src={card.front_media_url}
                                                    alt="Front media"
                                                    className="max-h-60 mx-auto rounded-lg"
                                                />
                                            </div>
                                        )}
                                        <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
                                            {card.front}
                                        </p>
                                        <div className="mt-8">
                                            <Button variant="outline" size="lg" className="gap-2">
                                                <RotateCcw className="h-4 w-4" />
                                                Show Answer
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Back */}
                                        <div className="mb-4">
                                            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                                                Answer
                                            </span>
                                        </div>
                                        {card.back_media_url && (
                                            <div className="mb-6">
                                                <img
                                                    src={card.back_media_url}
                                                    alt="Back media"
                                                    className="max-h-60 mx-auto rounded-lg"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xl md:text-2xl text-foreground leading-relaxed whitespace-pre-wrap">
                                            {card.back}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Card indicator */}
                            <div className="absolute top-4 right-4">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            card.card_state === "new"
                                                ? "#3b82f6"
                                                : card.card_state === "learning"
                                                    ? "#f59e0b"
                                                    : "#10b981",
                                    }}
                                />
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Rating Buttons */}
            {isFlipped && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-2xl"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-20 flex-col gap-2 border-2 border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRate(1)}
                            disabled={submitting}
                        >
                            <span className="text-lg font-bold">Again</span>
                            <span className="text-xs text-muted-foreground">1 day</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-20 flex-col gap-2 border-2 border-orange-500 hover:bg-orange-500 hover:text-white"
                            onClick={() => handleRate(2)}
                            disabled={submitting}
                        >
                            <span className="text-lg font-bold">Hard</span>
                            <span className="text-xs text-muted-foreground">
                                {Math.max(1, Math.round(card.interval * 1.2))} days
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-20 flex-col gap-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleRate(3)}
                            disabled={submitting}
                        >
                            <span className="text-lg font-bold">Good</span>
                            <span className="text-xs text-muted-foreground">
                                {card.repetitions === 0 ? 1 : card.repetitions === 1 ? 6 : Math.round(card.interval * card.ease_factor)} days
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-20 flex-col gap-2 border-2 border-green-500 hover:bg-green-500 hover:text-white"
                            onClick={() => handleRate(4)}
                            disabled={submitting}
                        >
                            <span className="text-lg font-bold">Easy</span>
                            <span className="text-xs text-muted-foreground">
                                {card.repetitions === 0
                                    ? 4
                                    : Math.round(card.interval * card.ease_factor * 1.3)}{" "}
                                days
                            </span>
                        </Button>
                    </div>

                    {/* Keyboard shortcuts hint */}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Press 1-4 or Space to flip, then 1-4 to rate
                    </p>
                </motion.div>
            )}

            {/* Loading overlay */}
            {submitting && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
