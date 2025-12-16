"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TourStep {
    target: string
    title: string
    content: string
    position?: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
    {
        target: "welcome",
        title: "Welcome to Vadea! 🎉",
        content: "Let's take a quick tour to help you get started with organizing your academic life.",
        position: "bottom"
    },
    {
        target: "[href='/dashboard']",
        title: "Dashboard",
        content: "Your central hub shows upcoming classes, assignments, and quick access to all features.",
        position: "bottom"
    },
    {
        target: "[href='/timetable']",
        title: "Timetable",
        content: "View and manage your class schedule. Add classes, exams, and study sessions here.",
        position: "bottom"
    },
    {
        target: "[href='/assignments']",
        title: "Assignments",
        content: "Track all your assignments and deadlines in one place. Never miss a due date!",
        position: "bottom"
    },
    {
        target: "[href='/resources']",
        title: "Resources",
        content: "Store and organize your study materials, notes, and course files securely.",
        position: "bottom"
    },
    {
        target: "[href='/ai-advisor']",
        title: "AI Advisor",
        content: "Get help with your studies from our AI assistant. Ask questions about your courses!",
        position: "bottom"
    },
    {
        target: "[href='/community']",
        title: "Community",
        content: "Join study groups, collaborate with classmates, and share resources.",
        position: "bottom"
    },
    {
        target: ".search-button",
        title: "Quick Search",
        content: "Press Ctrl+K anytime to quickly search and navigate the app!",
        position: "bottom"
    }
]

export function OnboardingTour() {
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [hasSeenTour, setHasSeenTour] = useState(true) // Default to true, will check server
    const [isNewUser, setIsNewUser] = useState(false)

    useEffect(() => {
        async function checkTourStatus() {
            try {
                const { createClient } = await import("@/lib/supabase/client")
                const supabase = createClient()

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Get user profile to check creation date and tour status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("created_at, has_seen_tour")
                    .eq("id", user.id)
                    .single()

                if (!profile) return

                // Check if user is new (created within last 5 minutes) AND hasn't seen tour
                const isNew = new Date().getTime() - new Date(profile.created_at).getTime() < 5 * 60 * 1000
                const hasSeen = profile.has_seen_tour || false

                setIsNewUser(isNew)
                setHasSeenTour(hasSeen)

                // Only show tour if user is new AND hasn't seen it
                if (isNew && !hasSeen) {
                    setTimeout(() => {
                        setIsActive(true)
                    }, 1500) // Small delay for better UX
                }
            } catch (error) {
                console.error("Error checking tour status:", error)
            }
        }

        checkTourStatus()
    }, [])

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        try {
            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Update profile to mark tour as seen
                await supabase
                    .from("profiles")
                    .update({ has_seen_tour: true })
                    .eq("id", user.id)
            }
        } catch (error) {
            console.error("Error marking tour as complete:", error)
        }

        setIsActive(false)
        setHasSeenTour(true)
    }

    const handleSkip = async () => {
        await handleComplete() // Same as complete - mark as seen
    }

    // Don't show tour if user has seen it or is not a new user
    if (!isActive || hasSeenTour || !isNewUser) return null

    const step = tourSteps[currentStep]
    const isWelcomeStep = step.target === "welcome"

    return (
        <>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[100]"
                onClick={handleSkip}
            />

            {/* Tour Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed z-[101] ${isWelcomeStep
                        ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        : "top-24 left-1/2 -translate-x-1/2"
                        }`}
                >
                    <Card className="w-[400px] shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.content}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 -mt-2 -mr-2"
                                    onClick={handleSkip}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="flex gap-1">
                                    {tourSteps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevious}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-1" />
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={handleNext}
                                    >
                                        {currentStep === tourSteps.length - 1 ? (
                                            "Got it!"
                                        ) : (
                                            <>
                                                Next
                                                <ArrowRight className="h-4 w-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleSkip}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip tour
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </>
    )
}
