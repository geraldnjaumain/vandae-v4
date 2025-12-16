import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard - Your Academic Overview',
    description: 'View your upcoming classes, assignments, and study schedule at a glance. Stay organized with your personalized academic dashboard.',
    openGraph: {
        title: 'Dashboard - Vadea Academic Planner',
        description: 'Your personalized academic overview and daily schedule',
        url: 'https://vadea.app/dashboard',
    },
}

export { default } from './dashboard-page'
