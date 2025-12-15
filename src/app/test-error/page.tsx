"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Bug, Zap } from "lucide-react"
import * as Sentry from "@sentry/nextjs"

export default function TestErrorPage() {
    const throwError = () => {
        throw new Error("🧪 Test Error: Sentry Integration Test - This is intentional!")
    }

    const throwAsyncError = async () => {
        throw new Error("🧪 Test Async Error: Promise rejection test - This is intentional!")
    }

    const captureMessage = () => {
        Sentry.captureMessage("🧪 Test Message: Manual Sentry message capture", "info")
        alert("Message sent to Sentry! Check your dashboard.")
    }

    const captureException = () => {
        try {
            throw new Error("🧪 Test Exception: Manual exception capture - This is intentional!")
        } catch (error) {
            Sentry.captureException(error)
            alert("Exception sent to Sentry! Check your dashboard.")
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bug className="h-6 w-6 text-orange-500" />
                            <div>
                                <CardTitle>Sentry Integration Test Page</CardTitle>
                                <CardDescription>
                                    Test error tracking and monitoring features
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                        Test Page - Delete After Verification
                                    </p>
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        This page is for testing Sentry error tracking. Click the buttons below to trigger
                                        different types of errors and verify they appear in your Sentry dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Error Boundary Test</CardTitle>
                                    <CardDescription>
                                        Triggers React error boundary and crashes the app
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={throwError} variant="destructive" className="w-full">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Throw Error
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Async Error Test</CardTitle>
                                    <CardDescription>
                                        Tests promise rejection handling
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={throwAsyncError} variant="destructive" className="w-full">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Throw Async Error
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Manual Message</CardTitle>
                                    <CardDescription>
                                        Sends info message without error
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={captureMessage} variant="outline" className="w-full">
                                        <Bug className="mr-2 h-4 w-4" />
                                        Send Message
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Manual Exception</CardTitle>
                                    <CardDescription>
                                        Captures exception without crashing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={captureException} variant="outline" className="w-full">
                                        <Bug className="mr-2 h-4 w-4" />
                                        Send Exception
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                How to Verify:
                            </h4>
                            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                                <li>Click any test button above</li>
                                <li>Visit your Sentry dashboard: sentry.io</li>
                                <li>Navigate to Issues or Events</li>
                                <li>Look for the test error (marked with 🧪)</li>
                                <li>Verify stack traces and context appear correctly</li>
                            </ol>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                After Testing:
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Delete this file: <code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
                                    src/app/test-error/page.tsx
                                </code>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
