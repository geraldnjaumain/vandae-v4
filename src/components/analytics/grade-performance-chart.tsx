"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { GradeEntry } from "@/app/actions/analytics"
import { format } from "date-fns"

interface GradePerformanceChartProps {
    grades: GradeEntry[]
}

export function GradePerformanceChart({ grades }: GradePerformanceChartProps) {
    // Sort grades by date and prepare chart data
    const chartData = [...grades]
        .sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime())
        .map((grade) => ({
            date: format(new Date(grade.graded_at), "MMM dd"),
            percentage: Number(grade.percentage.toFixed(1)),
        }))

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Grade Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-muted-foreground">No grades yet</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grade Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            label={{ value: "Grade %", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
