import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  Users,
  Calendar,
  FileText,
  Brain,
  CheckCircle2,
  ArrowRight,
  Menu,
  X
} from "lucide-react"
import { getUser } from "@/lib/supabase-server"
import { HeroClient } from "@/components/landing/hero-client"

import { VadeaLogoWithText } from "@/components/ui/logo"

export default async function LandingPage() {
  const user = await getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="transition-transform hover:scale-105 duration-200">
              <VadeaLogoWithText />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Button asChild className="transition-all duration-200 hover:scale-105">
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    Login
                  </Link>
                  <Button asChild className="transition-all duration-200 hover:scale-105">
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <Button asChild size="sm" className="transition-all duration-200">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="transition-all duration-200">
                  <Link href="/signup">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <HeroClient isAuthenticated={isAuthenticated} />

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need.<br />Nothing you don&#39;t.
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built specifically for students who want to stay organized without the complexity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1: AI Syllabus Parser */}
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-purple-950/30 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>AI Syllabus Parser</CardTitle>
                  <CardDescription>
                    Upload your syllabus PDF and let AI extract all deadlines and exam dates automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Auto-detect due dates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Parse exam schedules
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Smart categorization
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 2: Private File Storage */}
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Private File Storage</CardTitle>
                  <CardDescription>
                    Keep all your notes, PDFs, and study materials organized and secure in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Secure Encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Unlimited storage (Pro)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Smart search and tags
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 3: Community by Major */}
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Community by Major</CardTitle>
                  <CardDescription>
                    Connect with classmates, share resources, and collaborate on assignments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Study groups
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Resource sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Interest-based matching
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to get organized?
            </h2>
            <p className="text-xl text-background/70">
              Join thousands of students who have already simplified their academic life with Vadea.
            </p>
            {isAuthenticated ? (
              <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90 text-lg h-14 px-8 transition-all duration-200 hover:scale-105" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90 text-lg h-14 px-8 transition-all duration-200 hover:scale-105" asChild>
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
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-sm">
                V
              </div>
              <span className="font-bold text-lg">Vadea</span>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/legal/privacy" className="hover:text-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="hover:text-foreground transition-colors duration-200">
                Terms of Service
              </Link>
              <a href="mailto:support@vadea.com" className="hover:text-foreground transition-colors duration-200">
                Contact
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 Vadea. Built for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
