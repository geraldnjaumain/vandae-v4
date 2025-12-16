```typescript
import { Metadata } from "next"
import { getUserAnalytics, getActiveGoals, getStudySessions, getGradeEntries } from "@/app/actions/analytics"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export const metadata: Metadata = {
  title: 'Analytics - Track Your Academic Progress',
  description: 'Monitor your study time, grades, flashcard retention, and academic goals. Get AI-powered insights to improve your learning.',
  keywords: ['academic analytics', 'study tracking', 'grade tracker', 'learning analytics', 'student progress'],
}

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch all analytics data in parallel
    const [analyticsResult, goalsResult, sessionsResult, gradesResult] = await Promise.all([
        getUserAnalytics(),
        getActiveGoals(),
        getStudySessions(30),
        getGradeEntries(20),
    ])

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Track your progress, study habits, and performance over time
                    </p>
                </div>

                <AnalyticsDashboard
                    analytics={analyticsResult.data || null}
                    goals={goalsResult.data || []}
                    recentSessions={sessionsResult.data || []}
                    recentGrades={gradesResult.data || []}
                />
            </div>
        </div>
    )
}
