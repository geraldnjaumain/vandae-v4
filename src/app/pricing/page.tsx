import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { getUser } from "@/lib/supabase-server"
import { LandingNav } from "@/components/landing/landing-nav"
import { VadeaLogo } from "@/components/ui/logo"

export default async function PricingPage() {
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
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Start free and upgrade as you grow. No hidden fees.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Free Plan */}
                            <Card className="border-2 border-border bg-card">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Free</CardTitle>
                                    <CardDescription className="text-3xl font-bold text-foreground mt-4">
                                        $0 <span className="text-lg font-normal text-muted-foreground">/forever</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>AI Syllabus Parsing (5 per semester)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Secure File Vault (1GB storage)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Smart Calendar</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Join up to 3 communities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Mobile access</span>
                                        </li>
                                    </ul>
                                    <Button className="w-full" variant="outline" asChild>
                                        <Link href="/signup">Get Started Free</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Premium Plan */}
                            <Card className="border-2 border-primary bg-card relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                                    Coming Soon
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Premium</CardTitle>
                                    <CardDescription className="text-3xl font-bold text-foreground mt-4">
                                        $9.99 <span className="text-lg font-normal text-muted-foreground">/month</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span className="font-semibold">Everything in Free, plus:</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Unlimited AI Syllabus Parsing</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>10GB File Storage</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Unlimited Communities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Advanced AI Study Assistant</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            <span>Priority Support</span>
                                        </li>
                                    </ul>
                                    <Button className="w-full" disabled>
                                        Coming Soon
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Pricing FAQ</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Is the free plan really free forever?</h3>
                                <p className="text-muted-foreground">
                                    Yes! Our free plan includes all core features and will always be free. We believe every student deserves access to great organizational tools.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade anytime?</h3>
                                <p className="text-muted-foreground">
                                    Absolutely. When Premium launches, you'll be able to upgrade or downgrade at any time. No long-term contracts.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Do you offer student discounts?</h3>
                                <p className="text-muted-foreground">
                                    Vadea is built for students, so our pricing is already student-friendly. The free plan is designed to meet most students' needs.
                                </p>
                            </div>
                        </div>
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
