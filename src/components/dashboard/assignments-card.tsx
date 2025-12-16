"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { IllustrationEmpty } from "@/components/ui/illustrations"

interface AssignmentsCardProps {
    tasks: any[]
}

export function AssignmentsCard({ tasks }: AssignmentsCardProps) {
    return (
        <Card className="h-full border-border shadow-none hover:border-foreground/20 transition-colors duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Next Up
                </CardTitle>
                <Link href="/assignments" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 group-hover:translate-x-0.5 transition-all duration-200">
                    View Board <ArrowRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
                        <IllustrationEmpty className="h-24 w-24 opacity-80" />
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">All caught up!</p>
                            <p className="text-muted-foreground text-xs text-center px-4 mt-1">No pending assignments. Enjoy.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => {
                            const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                            return (
                                <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-all duration-200">
                                    <div className="mt-0.5 shrink-0">
                                        <Circle className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm text-foreground truncate leading-tight mb-1.5">{task.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {task.due_date && (
                                                <span className={cn("flex items-center gap-1", isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "")}>
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                            <span className={cn(
                                                "capitalize px-1.5 py-0 rounded text-[10px] font-medium border",
                                                task.priority === 'high' ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-300' :
                                                    task.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                            )}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
