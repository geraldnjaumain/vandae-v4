import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/supabase-server"
import { LandingNav } from "@/components/landing/landing-nav"
import { VadeaLogo } from "@/components/ui/logo"

export default async function BlogPage() {
    const user = await getUser()
    const isAuthenticated = !!user

    return (
        <div className="min-h-screen bg-background">
            <LandingNav isAuthenticated={isAuthenticated} />

            {/* Coming Soon */}
            <section className="py-48 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-8">
                            <span className="text-5xl">📝</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            Blog Coming Soon
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            We're working on bringing you helpful articles, study tips, and product updates. Check back soon!
                        </p>

                        <Button asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-background border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <VadeaLogo className="h-8 w-8" />
                                    <span className="font-bold text-xl">Vadea</span>
                                </div>
                                <p className="text-muted-foreground">
                                    Your academic life, organized.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Product</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                                    <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                                    <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Company</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                                    <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                                    <li><a href="mailto:support@vadea.com" className="hover:text-foreground transition-colors">Contact</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Legal</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                                    <li><Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-border pt-8">
                            <p className="text-center text-muted-foreground">
                                © 2025 Vadea. Built for students by students.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
