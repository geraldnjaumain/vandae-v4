"use client"

import { useState, useEffect } from "react"
import { getDashboardData } from "@/app/dashboard/actions"

export interface DashboardData {
    schedule: any[]
    tasks: any[]
    posts: any[]
    resources: any[]
    communities: any[]
    notifications: any[]
    profile: any
}

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)

                // Fetch all dashboard data in parallel
                const result = await getDashboardData()

                if (result.error) {
                    throw new Error(result.error)
                }

                setData(result.data as DashboardData)
            } catch (err: any) {
                console.error('Dashboard data fetch error:', err)
                setError(err.message || 'Failed to load dashboard data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, isLoading, error, refetch: () => setIsLoading(true) }
}
