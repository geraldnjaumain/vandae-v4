import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  Lock,
  Users,
  Upload,
  FolderOpen,
  MessageCircle,
  Check,
  ArrowRight,
  Mail,
  ChevronDown,
} from "lucide-react"
import { getUser } from "@/lib/supabase-server"
import { HeroClient } from "@/components/landing/hero-client"
import { LandingNav } from "@/components/landing/landing-nav"
import { VadeaLogo } from "@/components/ui/logo"

export default async function LandingPage() {
  const user = await getUser()
  const isAuthenticated = !!user

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI Syllabus Parser",
      description: "Upload your syllabus PDF and let AI automatically extract all deadlines, assignments, and important dates into your calendar.",
    },
    {
      icon: <Lock className="h-8 w-8 text-secondary" />,
      title: "Secure File Vault",
      description: "Keep all your notes, PDFs, and study materials organized in one secure place. Access them from anywhere, anytime.",
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: "Study Communities",
      description: "Connect with classmates in your major. Share resources, collaborate on projects, and help each other succeed.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Smart Calendar",
      description: "Never miss a deadline again. View all your assignments, exams, and events in one unified calendar view.",
    },
  ]

  const steps = [
    {
      number: "1",
      title: "Upload Your Syllabus",
      description: "Simply upload your PDF syllabus and our AI will analyze it in seconds.",
    },
    {
      number: "2",
      title: "Organize Your Files",
      description: "Store and categorize all your study materials in your personal vault.",
    },
    {
      number: "3",
      title: "Collaborate & Succeed",
      description: "Join communities, share resources, and crush your semester together.",
    },
  ]

  const testimonials = [
    {
      quote: "Vadea saved my semester. The AI syllabus parser is a game changer.",
      author: "Alex C.",
      role: "Computer Science Student",
    },
    {
      quote: "Finally an app that combines my files, calendar, and study groups.",
      author: "Sarah M.",
      role: "Pre-med",
    },
    {
      quote: "The interface is beautiful and so easy to use. Love the dark mode.",
      author: "Jordan T.",
      role: "Design Student",
    },
  ]

  const faqs = [
    {
      question: "Is Vadea free to use?",
      answer: "Yes! Vadea offers a free forever plan with all core features. Premium plans are available for advanced features.",
    },
    {
      question: "How does the AI syllabus parser work?",
      answer: "Our AI reads your syllabus PDF, identifies important dates, assignments, and deadlines, then automatically adds them to your calendar.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption to protect your data. Your files and information are stored securely and privately.",
    },
    {
      question: "Can I use Vadea on mobile?",
      answer: "Yes! Vadea works on all devices - desktop, tablet, and mobile. Access your academic life from anywhere.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingNav isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <HeroClient isAuthenticated={isAuthenticated} />

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for students
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                How it works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in 3 simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Loved by students
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of students who are crushing their goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Check key={i} className="h-5 w-5 text-secondary fill-secondary" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-6 text-lg">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-between">
                      {faq.question}
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to ace your semester?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who have already organized their academic life with Vadea
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

            <p className="text-sm mt-6 opacity-75">
              No credit card required • Free forever plan
            </p>
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
                  <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
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
