import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://vadea.app'

    // Static pages
    const routes = [
        '',
        '/dashboard',
        '/timetable',
        '/assignments',
        '/resources',
        '/flashcards',
        '/analytics',
        '/community',
        '/ai-advisor',
        '/notifications',
        '/settings',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Marketing/public pages with higher priority
    const publicPages = [
        '/about',
        '/features',
        '/pricing',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    return [...routes, ...publicPages]
}
