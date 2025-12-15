"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface LoadingScreenProps {
    onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Fast progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 5
            })
        }, 50)

        // Complete when progress reaches 100
        const timer = setTimeout(() => {
            onComplete()
        }, 1200)

        return () => {
            clearInterval(interval)
            clearTimeout(timer)
        }
    }, [onComplete])

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="w-64">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-foreground"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>
            </div>
        </div>
    )
}
