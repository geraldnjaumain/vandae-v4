"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { StudySession } from "@/app/actions/analytics"
import { subDays, format, startOfDay, isSameDay } from "date-fns"

interface StudyTimeChartProps {
    sessions: StudySession[]
    timeRange: "week" | "month"
}

export function StudyTimeChart({ sessions, timeRange }: StudyTimeChartProps) {
    const days = timeRange === "week" ? 7 : 30

    // Generate data for chart
    const chartData = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i)
        const dayStart = startOfDay(date)

        // Sum study time for this day
        const dayStudyTime = sessions
            .filter((session) => isSameDay(new Date(session.started_at), dayStart))
            .reduce((sum, session) => sum + (session.duration || 0), 0)

        return {
            date: format(date, "MMM dd"),
            hours: Number((dayStudyTime / 3600).toFixed(1)),
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                        />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
