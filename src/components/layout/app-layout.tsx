import * as React from "react"
import { cn } from "@/lib/utils"
import { TopNav } from "./top-nav"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"

interface AppLayoutProps {
    children: React.ReactNode
    className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <OnboardingTour />
            <TopNav />
            <main className={cn("flex-1 w-full px-4 md:px-6 py-6", className)}>
                {children}
            </main>
        </div>
    )
}
