"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, TrendingUp } from "lucide-react"
import type { UserGoal } from "@/app/actions/analytics"
import { CreateGoalDialog } from "./create-goal-dialog"

interface GoalsSectionProps {
    goals: UserGoal[]
    analytics: any
}

export function GoalsSection({ goals, analytics }: GoalsSectionProps) {
    const [showCreateDialog, setShowCreateDialog] = React.useState(false)

    const getGoalProgress = (goal: UserGoal) => {
        return Math.min((goal.current_value / goal.target_value) * 100, 100)
    }

    const getGoalStatus = (goal: UserGoal) => {
        const progress = getGoalProgress(goal)
        if (progress >= 100) return "completed"
        if (progress >= 75) return "onTrack"
        if (progress >= 50) return "moderate"
        return "needsWork"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500"
            case "onTrack":
                return "bg-blue-500"
            case "moderate":
                return "bg-yellow-500"
            default:
                return "bg-red-500"
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Personal Goals</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Set and track your learning objectives
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Goal
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Target className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-sm font-medium text-foreground mb-1">No goals yet</p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Set a goal to stay motivated and track your progress
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Your First Goal
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => {
                            const progress = getGoalProgress(goal)
                            const status = getGoalStatus(goal)

                            return (
                                <div key={goal.id} className="p-4 rounded-lg border border-border bg-card">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-foreground">{goal.title}</h4>
                                            {goal.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <TrendingUp className={cn("h-4 w-4", getStatusColor(status).replace("bg-", "text-"))} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {goal.current_value} / {goal.target_value} {goal.unit}
                                            </span>
                                            <span className="font-medium">{progress.toFixed(0)}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>

                                    {goal.target_date && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Target: {new Date(goal.target_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>

            <CreateGoalDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </Card>
    )
}
