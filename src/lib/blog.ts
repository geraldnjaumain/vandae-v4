import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

export interface BlogPost {
    slug: string
    title: string
    description: string
    publishedAt: string
    author: string
    category: string
    tags: string[]
    image: string
    content: string
    readingTime: string
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    if (!fs.existsSync(BLOG_DIR)) {
        return []
    }

    const files = fs.readdirSync(BLOG_DIR)
    const posts = await Promise.all(
        files
            .filter((file) => file.endsWith('.mdx'))
            .map(async (file) => {
                const slug = file.replace('.mdx', '')
                const post = await getBlogPost(slug)
                return post
            })
    )

    return posts
        .filter((post): post is BlogPost => post !== null)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

        if (!fs.existsSync(filePath)) {
            return null
        }

        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContent)
        const stats = readingTime(content)

        return {
            slug,
            title: data.title,
            description: data.description,
            publishedAt: data.publishedAt,
            author: data.author || 'Vadea Team',
            category: data.category || 'General',
            tags: data.tags || [],
            image: data.image || '/blog/default.jpg',
            content,
            readingTime: stats.text,
        }
    } catch (error) {
        console.error(`Error loading blog post ${slug}:`, error)
        return null
    }
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    const allPosts = await getAllBlogPosts()
    return allPosts.filter((post) => post.category === category)
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
    const allPosts = await getAllBlogPosts()
    return allPosts.filter((post) => post.tags.includes(tag))
}

export async function getAllCategories(): Promise<string[]> {
    const posts = await getAllBlogPosts()
    return Array.from(new Set(posts.map((post) => post.category)))
}

export async function getAllTags(): Promise<string[]> {
    const posts = await getAllBlogPosts()
    const tags = posts.flatMap((post) => post.tags)
    return Array.from(new Set(tags))
}
