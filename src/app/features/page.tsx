import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { FAQSchema } from '@/components/seo/faq-schema'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
    title: 'Features - All-in-One Academic Platform',
    description: 'Explore Vadea\'s powerful features: smart timetables, AI flashcards with spaced repetition, assignment tracking, study analytics, and collaborative tools.',
    keywords: ['academic planner features', 'student productivity tools', 'flashcard app', 'study tracker', 'assignment manager'],
    openGraph: {
        title: 'Vadea Features - Complete Academic Toolkit',
        description: 'Everything you need to succeed academically in one platform',
        url: 'https://vadea.app/features',
    },
}

const faqs = [
    {
        question: 'What is spaced repetition and how does Vadea use it?',
        answer: 'Spaced repetition is a scientifically-proven learning technique that schedules reviews at optimal intervals. Vadea uses the SM-2 algorithm to automatically determine when you should review each flashcard based on how well you remember it, maximizing long-term retention.',
    },
    {
        question: 'Can I import my class schedule into Vadea?',
        answer: 'Yes! Vadea allows you to manually add classes or import your schedule. You can set recurring classes, add exam dates, and sync everything to your calendar.',
    },
    {
        question: 'How does the AI study assistant work?',
        answer: 'Our AI advisor uses Google\'s Gemini model to help you study smarter. It can generate flashcards from your notes, explain complex concepts, provide study tips, and answer questions about your coursework.',
    },
    {
        question: 'Is my data secure and private?',
        answer: 'Absolutely. Vadea uses Supabase with row-level security (RLS) to ensure your data is encrypted and only accessible to you. We never sell your data to third parties.',
    },
    {
        question: 'Can I collaborate with classmates on Vadea?',
        answer: 'Yes! Vadea includes community features where you can join study groups, share resources, ask questions, and collaborate on assignments with your classmates.',
    },
    {
        question: 'Does Vadea work offline?',
        answer: 'Vadea is primarily a web application that requires internet connectivity. However, we cache frequently accessed data so you can view your schedule and flashcards with limited connectivity.',
    },
    {
        question: 'How much does Vadea cost?',
        answer: 'Vadea offers a free tier with core features including timetables, flashcards, and basic analytics. Premium features like unlimited AI generations and advanced analytics are available in our paid plans.',
    },
    {
        question: 'Can I export my data from Vadea?',
        answer: 'Yes! You can export your flashcards in Anki format (.tsv), and download your study data, grades, and analytics as CSV files. We believe your data should always be portable.',
    },
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Features' },
                    ]}
                />

                <FAQSchema items={faqs} />

                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Everything You Need to Excel Academically
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Vadea combines powerful productivity tools with AI to help you study smarter, stay organized, and achieve your academic goals.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div key={index} className="p-6 rounded-lg border border-border bg-card">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="max-w-3xl mx-auto">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    )
}

const features = [
    {
        icon: '📅',
        title: 'Smart Timetable',
        description: 'Visual weekly schedule with recurring classes, exams, and study sessions. Sync to Google Calendar.',
    },
    {
        icon: '🎯',
        title: 'Assignment Tracking',
        description: 'Never miss a deadline. Track all your assignments, projects, and exams with priority levels and due dates.',
    },
    {
        icon: '🧠',
        title: 'AI Flashcards',
        description: 'Create flashcards manually or generate them instantly from your notes using AI. Includes spaced repetition.',
    },
    {
        icon: '📊',
        title: 'Study Analytics',
        description: 'Track your study time, retention rates, grade trends, and get AI-powered insights to improve.',
    },
    {
        icon: '📚',
        title: 'Resource Library',
        description: 'Store and organize all your course materials, notes, PDFs, and study resources in one place.',
    },
    {
        icon: '👥',
        title: 'Study Communities',
        description: 'Join subject-based communities, share resources, ask questions, and collaborate with classmates.',
    },
    {
        icon: '🤖',
        title: 'AI Study Assistant',
        description: 'Get instant help with concepts, generate study guides, and receive personalized study recommendations.',
    },
    {
        icon: '🔔',
        title: 'Smart Notifications',
        description: 'Automated reminders for upcoming deadlines, flashcard reviews, and study sessions.',
    },
    {
        icon: '📈',
        title: 'Grade Tracking',
        description: 'Monitor your academic performance over time with visual charts and semester GPA calculations.',
    },
]
