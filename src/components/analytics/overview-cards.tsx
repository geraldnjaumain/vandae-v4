"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, Brain, Flame } from "lucide-react"

interface OverviewCardsProps {
    analytics: any
    timeRange: "week" | "month"
}

export function OverviewCards({ analytics, timeRange }: OverviewCardsProps) {
    const studyTime =
        timeRange === "week"
            ? analytics.study_time_week_seconds || 0
            : analytics.study_time_month_seconds || 0

    const studyDays =
        timeRange === "week"
            ? analytics.study_days_week || 0
            : analytics.study_days_month || 0

    const studyTimeHours = Math.floor(studyTime / 3600)
    const studyTimeMinutes = Math.floor((studyTime % 3600) / 60)

    const avgGrade = analytics.avg_grade_percentage || 0
    const flashcardRetention =
        analytics.flashcard_total > 0
            ? Math.round((analytics.flashcard_correct / analytics.flashcard_total) * 100)
            : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Study Time */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {studyTimeHours}h {studyTimeMinutes}m
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {studyDays} {studyDays === 1 ? "day" : "days"} active
                    </p>
                </CardContent>
            </Card>

            {/* Average Grade */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgGrade.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {analytics.total_grades || 0} assignments graded
                    </p>
                </CardContent>
            </Card>

            {/* Flashcard Retention */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flashcard Retention</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{flashcardRetention}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {analytics.flashcard_total || 0} cards reviewed
                    </p>
                </CardContent>
            </Card>

            {/* Study Streak */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.study_streak || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {analytics.study_streak === 1 ? "day" : "days"} in a row
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
