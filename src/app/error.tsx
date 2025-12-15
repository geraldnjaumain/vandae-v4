"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to Sentry
        Sentry.captureException(error)

        // Also log to console in development
        console.error('Error boundary caught:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-notion-bg flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Don't worry, your data is safe.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Error Details (Development only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <p className="text-xs font-mono text-gray-700 break-words">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button onClick={reset} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Return Home
                            </Link>
                        </Button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-center text-gray-600">
                        If this problem persists, please{" "}
                        <a href="mailto:support@vadae.com" className="text-blue-600 hover:underline">
                            contact support
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
