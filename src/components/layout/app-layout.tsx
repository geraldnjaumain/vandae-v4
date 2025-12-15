import * as React from "react"
import { cn } from "@/lib/utils"
import { NavSidebar } from "./nav-sidebar"

interface AppLayoutProps {
    children: React.ReactNode
    className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-notion-bg">
            <NavSidebar />
            <main className={cn("flex-1 overflow-y-auto", className)}>
                {children}
            </main>
        </div>
    )
}
