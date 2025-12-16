import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { Illustration404 } from "@/components/ui/illustrations"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <Illustration404 className="w-full max-w-lg h-auto mb-8 animate-in fade-in zoom-in duration-500" />

            <h1 className="text-4xl font-bold tracking-tight mb-4">Page Not Found</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                Oops! It seems like the page you're trying to access doesn't exist or has been moved.
            </p>

            <Button asChild size="lg">
                <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
    )
}
