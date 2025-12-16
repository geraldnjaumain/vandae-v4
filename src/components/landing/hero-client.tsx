"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"

interface HeroClientProps {
    isAuthenticated: boolean
}

export function HeroClient({ isAuthenticated }: HeroClientProps) {
    return (
        <section className="relative bg-white dark:bg-background py-24 md:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                        Your Academic Life, <span className="text-primary">Organized</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        AI-powered platform for students to manage schedules, files, and study groups — all in one place
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        {isAuthenticated ? (
                            <Button size="lg" asChild className="text-lg h-14 px-8">
                                <Link href="/dashboard">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" asChild className="text-lg h-14 px-8">
                                    <Link href="/signup">
                                        Start Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8">
                                    <Link href="#how-it-works">
                                        See How It Works
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {!isAuthenticated && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Check className="h-4 w-4 text-secondary" />
                            No credit card required • Free forever plan
                        </p>
                    )}
                </div>

                {/* Hero Visual - Simple Dashboard Mockup */}
                <div className="mt-16 max-w-5xl mx-auto">
                    <div className="bg-muted rounded-2xl border border-border p-4 shadow-lg">
                        <div className="bg-white dark:bg-card rounded-xl border border-border overflow-hidden">
                            {/* Simple dashboard preview */}
                            <div className="bg-primary/5 dark:bg-primary/10 p-6 border-b border-border">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 w-48 bg-foreground/10 rounded"></div>
                                    <div className="h-4 w-64 bg-foreground/5 rounded"></div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-primary/10 rounded-xl border border-primary/20"></div>
                                    <div className="h-24 bg-secondary/10 rounded-xl border border-secondary/20"></div>
                                    <div className="h-24 bg-accent/10 rounded-xl border border-accent/20"></div>
                                </div>
                                <div className="h-32 bg-muted/50 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
