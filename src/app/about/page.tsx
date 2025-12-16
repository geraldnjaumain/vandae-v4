import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/supabase-server"
import { LandingNav } from "@/components/landing/landing-nav"
import { VadeaLogo } from "@/components/ui/logo"
import { ArrowRight } from "lucide-react"

export default async function AboutPage() {
    const user = await getUser()
    const isAuthenticated = !!user

    return (
        <div className="min-h-screen bg-background">
            <LandingNav isAuthenticated={isAuthenticated} />

            {/* Hero */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            Built for Students, <span className="text-primary">By Students</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Vadea is your all-in-one academic companion, designed to help you stay organized and succeed.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-8">Our Mission</h2>
                        <p className="text-xl text-muted-foreground text-center mb-12">
                            We believe every student deserves powerful tools to manage their academic life.
                            Vadea combines AI-powered automation with intuitive design to help you focus on what matters most: learning.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎯</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2">Stay Organized</h3>
                                <p className="text-muted-foreground">
                                    Never miss a deadline with our smart calendar and AI syllabus parsing
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🤝</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2">Collaborate Better</h3>
                                <p className="text-muted-foreground">
                                    Connect with classmates and build study communities that help everyone succeed
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">⚡</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2">Work Smarter</h3>
                                <p className="text-muted-foreground">
                                    AI-powered tools automate busy work so you can focus on actual learning
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8">Our Story</h2>
                        <div className="space-y-6 text-lg text-muted-foreground">
                            <p>
                                Vadea started from a simple observation: students juggle dozens of syllabi, assignments,
                                deadlines, and study materials across multiple platforms. It's overwhelming.
                            </p>
                            <p>
                                We built Vadea to solve this problem. By combining AI automation with an intuitive interface,
                                we've created a platform that helps students organize their entire academic life in one place.
                            </p>
                            <p>
                                Today, thousands of students use Vadea to stay on top of their coursework, collaborate with
                                peers, and achieve their academic goals. And we're just getting started.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to get organized?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of students who have already simplified their academic life
                        </p>

                        {isAuthenticated ? (
                            <Button size="lg" variant="secondary" asChild className="text-lg h-16 px-10">
                                <Link href="/dashboard">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" variant="secondary" asChild className="text-lg h-16 px-10">
                                <Link href="/signup">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
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
