"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StudySession } from "@/app/actions/analytics"
import { subDays, startOfDay, isSameDay, format } from "date-fns"
import { Flame } from "lucide-react"

interface StudyStreakCalendarProps {
    sessions: StudySession[]
    streak: number
}

export function StudyStreakCalendar({ sessions, streak }: StudyStreakCalendarProps) {
    // Generate last 42 days (6 weeks) for calendar view
    const days = Array.from({ length: 42 }, (_, i) => {
        const date = subDays(new Date(), 41 - i)
        const dayStart = startOfDay(date)

        // Check if user studied on this day
        const hasSession = sessions.some((session) =>
            isSameDay(new Date(session.started_at), dayStart)
        )

        // Calculate total study time for this day
        const dayStudyTime = sessions
            .filter((session) => isSameDay(new Date(session.started_at), dayStart))
            .reduce((sum, session) => sum + (session.duration || 0), 0)

        return {
            date: dayStart,
            hasSession,
            studyTime: dayStudyTime,
        }
    })

    const getIntensityClass = (studyTime: number) => {
        if (studyTime === 0) return "bg-muted"
        if (studyTime < 1800) return "bg-primary/30" // < 30 min
        if (studyTime < 3600) return "bg-primary/50" // < 1 hour
        if (studyTime < 7200) return "bg-primary/70" // < 2 hours
        return "bg-primary" // 2+ hours
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Study Activity</CardTitle>
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-2xl font-bold">{streak}</span>
                        <span className="text-sm text-muted-foreground">day streak</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-2">
                    {/* Day labels */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-xs text-center text-muted-foreground font-medium">
                            {day}
                        </div>
                    ))}

                    {/* Calendar cells */}
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "aspect-square rounded-sm transition-colors",
                                getIntensityClass(day.studyTime),
                                day.hasSession && "cursor-pointer hover:ring-2 hover:ring-primary"
                            )}
                            title={`${format(day.date, "MMM dd")}: ${day.hasSession ? `${Math.round(day.studyTime / 60)} min` : "No activity"}`}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <div className="w-3 h-3 rounded-sm bg-primary/30" />
                    <div className="w-3 h-3 rounded-sm bg-primary/50" />
                    <div className="w-3 h-3 rounded-sm bg-primary/70" />
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span>More</span>
                </div>
            </CardContent>
        </Card>
    )
}
