import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-notion-bg flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <FileQuestion className="h-10 w-10 text-gray-400" />
                    </div>
                    <CardTitle className="text-3xl">404</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        This file is lost in the library
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-gray-600">
                        The page you're looking for doesn't exist or has been moved to a different folder.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">
                                <Search className="mr-2 h-4 w-4" />
                                Back to Homepage
                            </Link>
                        </Button>
                    </div>

                    {/* Helpful Links */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Popular pages:</p>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/community" className="text-xs text-blue-600 hover:underline">
                                Community
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link href="/settings" className="text-xs text-blue-600 hover:underline">
                                Settings
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link href="/legal/privacy" className="text-xs text-blue-600 hover:underline">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
