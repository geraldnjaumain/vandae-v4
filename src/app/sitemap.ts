import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }))

    // Blog posts
    const posts = await getAllBlogPosts()
    const blogPosts = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
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

    return [...routes, ...blogPosts, ...publicPages]
}
