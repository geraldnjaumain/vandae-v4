"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VadeaLogo } from "@/components/ui/logo"

interface LandingNavProps {
    isAuthenticated?: boolean
}

export function LandingNav({ isAuthenticated = false }: LandingNavProps) {
    return (
        <nav className="sticky top-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <VadeaLogo className="h-8 w-8" />
                        <span className="font-bold text-xl text-foreground">Vadea</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="#features"
                            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* Auth Buttons - Conditional based on authentication */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Button asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                                    <Link href="/signin">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
