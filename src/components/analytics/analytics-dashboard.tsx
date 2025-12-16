"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewCards } from "./overview-cards"
import { StudyTimeChart } from "./study-time-chart"
import { GradePerformanceChart } from "./grade-performance-chart"
import { GoalsSection } from "./goals-section"
import { InsightsCard } from "./insights-card"
import { StudyStreakCalendar } from "./study-streak-calendar"
import type { StudySession, GradeEntry, UserGoal } from "@/app/actions/analytics"

interface AnalyticsDashboardProps {
  analytics: any
  goals: UserGoal[]
  recentSessions: StudySession[]
  recentGrades: GradeEntry[]
}

export function AnalyticsDashboard({
  analytics,
  goals,
  recentSessions,
  recentGrades,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = React.useState<"week" | "month">("week")

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No analytics data yet. Start studying to see your progress!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Cards */}
      <OverviewCards analytics={analytics} timeRange={timeRange} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <StudyTimeChart sessions={recentSessions} timeRange={timeRange} />

        {/* Grade Performance */}
        <GradePerformanceChart grades={recentGrades} />

        {/* Study Streak Calendar */}
        <StudyStreakCalendar sessions={recentSessions} streak={analytics.study_streak} />

        {/* AI Insights */}
        <InsightsCard analytics={analytics} sessions={recentSessions} grades={recentGrades} />
      </div>

      {/* Goals Section */}
      <GoalsSection goals={goals} analytics={analytics} />
    </div>
  )
}
