import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Analytics - Track Your Academic Progress',
    description: 'Monitor your study time, grades, flashcard retention, and academic goals. Get AI-powered insights to improve your learning.',
    keywords: ['academic analytics', 'study tracking', 'grade tracker', 'learning analytics', 'student progress'],
    openGraph: {
        title: 'Analytics - Track Your Academic Performance',
        description: 'Visualize your study habits and academic progress with detailed analytics',
        url: 'https://vadea.app/analytics',
    },
}

export { default } from './analytics-page'
