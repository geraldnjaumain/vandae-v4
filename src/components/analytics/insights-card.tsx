"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import type { StudySession, GradeEntry } from "@/app/actions/analytics"

interface InsightsCardProps {
    analytics: any
    sessions: StudySession[]
    grades: GradeEntry[]
}

export function InsightsCard({ analytics, sessions, grades }: InsightsCardProps) {
    const insights: Array<{ type: "positive" | "warning" | "tip"; message: string }> = []

    // Study streak insight
    if (analytics.study_streak >= 7) {
        insights.push({
            type: "positive",
            message: `Amazing! You've maintained a ${analytics.study_streak}-day study streak. Keep it up!`,
        })
    } else if (analytics.study_streak === 0) {
        insights.push({
            type: "warning",
            message: "Start a study session today to begin building your streak!",
        })
    }

    // Grade performance
    const avgGrade = analytics.avg_grade_percentage || 0
    if (avgGrade >= 90) {
        insights.push({
            type: "positive",
            message: `Excellent performance! Your average grade of ${avgGrade.toFixed(1)}% is outstanding.`,
        })
    } else if (avgGrade < 70 && avgGrade > 0) {
        insights.push({
            type: "warning",
            message: `Your average grade is ${avgGrade.toFixed(1)}%. Consider spending more time reviewing difficult topics.`,
        })
    }

    // Study time
    const weeklyStudyHours = (analytics.study_time_week_seconds || 0) / 3600
    if (weeklyStudyHours < 5) {
        insights.push({
            type: "tip",
            message: `You've studied ${weeklyStudyHours.toFixed(1)} hours this week. Try to reach at least 10 hours for better results.`,
        })
    }

    // Flashcard retention
    const retention =
        analytics.flashcard_total > 0
            ? (analytics.flashcard_correct / analytics.flashcard_total) * 100
            : 0
    if (retention >= 80) {
        insights.push({
            type: "positive",
            message: `Great flashcard retention at ${retention.toFixed(0)}%! Your study technique is working.`,
        })
    } else if (retention < 60 && retention > 0) {
        insights.push({
            type: "tip",
            message: `Flashcard retention is ${retention.toFixed(0)}%. Try spacing out your reviews more.`,
        })
    }

    // Consistent study pattern
    const studyDays = analytics.study_days_week || 0
    if (studyDays >= 5) {
        insights.push({
            type: "positive",
            message: "Excellent consistency! You've studied on most days this week.",
        })
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "positive":
                return <TrendingUp className="h-4 w-4 text-green-500" />
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case "tip":
                return <Lightbulb className="h-4 w-4 text-blue-500" />
            default:
                return <Lightbulb className="h-4 w-4" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
                {insights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Keep studying to unlock personalized insights!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="mt-0.5">{getIcon(insight.type)}</div>
                                <p className="text-sm text-foreground flex-1">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
