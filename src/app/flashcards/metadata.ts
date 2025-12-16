import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Flashcards - Spaced Repetition Learning',
    description: 'Create and study flashcards using scientifically-proven spaced repetition. Improve retention and ace your exams with smart study tools.',
    keywords: ['flashcards', 'spaced repetition', 'study cards', 'memorization', 'SM-2 algorithm', 'learning tools'],
    openGraph: {
        title: 'Flashcards - Vadea Spaced Repetition System',
        description: 'Study smarter with AI-powered flashcards and spaced repetition',
        url: 'https://vadea.app/flashcards',
    },
}

export { default } from './flashcards-page'
