"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    FileText,
    Brain,
    ArrowRight
} from "lucide-react"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
}

interface HeroClientProps {
    isAuthenticated: boolean
}

export function HeroClient({ isAuthenticated }: HeroClientProps) {
    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div {...fadeInUp}>
                            <Badge variant="outline" className="mb-6 text-sm font-medium transition-all duration-200 hover:scale-105">
                                Your Academic Second Brain
                            </Badge>
                        </motion.div>

                        <motion.h1
                            {...fadeInUp}
                            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                        >
                            Stop drowning in PDFs.<br />
                            <span className="text-muted-foreground">Start crushing your semester.</span>
                        </motion.h1>

                        <motion.p
                            {...fadeInUp}
                            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                        >
                            The all-in-one OS for students. Timetable, Files, and AI Advisor in one tab.
                        </motion.p>

                        <motion.div
                            {...fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                        >
                            {isAuthenticated ? (
                                <Button size="lg" asChild className="text-lg h-14 px-8 transition-all duration-200 hover:scale-105">
                                    <Link href="/dashboard">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" asChild className="text-lg h-14 px-8 transition-all duration-200 hover:scale-105">
                                        <Link href="/signup">
                                            Get Started Free
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8 transition-all duration-200 hover:scale-105">
                                        <Link href="#features">
                                            See How It Works
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </motion.div>

                        {!isAuthenticated && (
                            <motion.p
                                {...fadeInUp}
                                className="text-sm text-muted-foreground"
                            >
                                No credit card required • Free forever plan
                            </motion.p>
                        )}
                    </div>

                    {/* Hero Visual - Bento Grid Mockup */}
                    <motion.div
                        {...fadeInUp}
                        className="mt-20 max-w-6xl mx-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border border-border">
                            {/* Time Card */}
                            <Card className="md:col-span-2 transition-all duration-300 hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Today&#39;s Schedule
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-500">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">CS 101 - Algorithms</p>
                                            <p className="text-xs text-muted-foreground">2:00 PM - 3:30 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">In 2h</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-500">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Physics Lab</p>
                                            <p className="text-xs text-muted-foreground">4:00 PM - 6:00 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">Later</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes Card */}
                            <Card className="transition-all duration-300 hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        Quick Notes
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-muted rounded"></div>
                                        <div className="h-2 w-4/5 bg-muted rounded"></div>
                                        <div className="h-2 w-3/5 bg-muted rounded"></div>
                                        <div className="h-2 w-full bg-muted rounded"></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Card */}
                            <Card className="md:col-span-3 transition-all duration-300 hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Brain className="h-4 w-4" />
                                        AI Advisor
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                        <p className="text-sm text-foreground">
                                            Your syllabus has been analyzed. <span className="font-semibold">12 events</span> added to your calendar.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
