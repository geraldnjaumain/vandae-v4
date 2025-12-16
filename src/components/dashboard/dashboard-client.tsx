"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScheduleCard } from "@/components/dashboard/schedule-card"
import { AssignmentsCard } from "@/components/dashboard/assignments-card"
import { ResourcesCard } from "@/components/dashboard/resources-card"
import { CommunityCard } from "@/components/dashboard/community-card"
import { QuickNotesCard } from "@/components/dashboard/quick-notes-card"
import { getDashboardData } from "@/app/dashboard/actions"
import { toast } from "sonner"

interface DashboardClientProps {
    userName: string
}

// Simple in-memory cache
let cachedData: any = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function DashboardClient({ userName }: DashboardClientProps) {
    const [showLoading, setShowLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            // Check if we have valid cached data
            const now = Date.now()
            if (cachedData && (now - cacheTime) < CACHE_DURATION) {
                // Use cached data - instant load!
                setData(cachedData)
                setIsLoading(false)
                setShowLoading(false)
                return
            }

            // Fetch fresh data
            try {
                const result = await getDashboardData()

                if (result.error) {
                    toast.error(result.error)
                    setIsLoading(false)
                    setShowLoading(false)
                    return
                }

                // Cache the data
                cachedData = result.data
                cacheTime = Date.now()

                setData(result.data)
                setIsLoading(false)
            } catch (error: any) {
                console.error('Dashboard error:', error)
                toast.error('Failed to load dashboard')
                setIsLoading(false)
                setShowLoading(false)
            }
        }

        loadData()
    }, [])

    // Loading handler removed

    return (
        <>
            {/* Loading removed as per user request */}

            {!isLoading && data && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="container mx-auto p-4 md:p-6 max-w-[1600px] space-y-6"
                >
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's what's happening with your studies today
                        </p>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Schedule Card */}
                        <div className="lg:col-span-2">
                            <ScheduleCard schedule={data.schedule || []} />
                        </div>

                        {/* Quick Notes */}
                        <div>
                            <QuickNotesCard />
                        </div>

                        {/* Assignments */}
                        <div>
                            <AssignmentsCard tasks={data.tasks || []} />
                        </div>

                        {/* Resources */}
                        <div>
                            <ResourcesCard resources={data.resources || []} />
                        </div>

                        {/* Community */}
                        <div>
                            <CommunityCard post={data.posts?.[0] || null} />
                        </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-center gap-8 p-6 rounded-xl bg-muted/30 border border-border">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{data.tasks?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Active Tasks</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{data.schedule?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Classes Today</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{data.communities?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Communities</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{data.notifications?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Notifications</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    )
}
