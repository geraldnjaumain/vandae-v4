import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost, getAllBlogPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'


export async function generateStaticParams() {
    const posts = await getAllBlogPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params
    const post = await getBlogPost(params.slug)

    if (!post) {
        return {
            title: 'Post Not Found',
        }
    }

    return {
        title: `${post.title} | Vadea Blog`,
        description: post.description,
        keywords: post.tags,
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
            images: [post.image],
            url: `https://vadea.app/blog/${post.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [post.image],
        },
    }
}


export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const post = await getBlogPost(params.slug)

    if (!post) {
        notFound()
    }

    return (
        <article className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Back Button */}
                <Link href="/blog">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blog
                    </Button>
                </Link>

                {/* Header */}
                <header className="mb-8">
                    <Badge variant="secondary" className="mb-4">
                        {post.category}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                    <p className="text-xl text-muted-foreground mb-6">{post.description}</p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                        <span>By {post.author}</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime}
                        </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Featured Image - Gradient Background */}
                    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-primary/5" />
                </header>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <MDXRemote source={post.content} />
                </div>

                {/* Footer CTA */}
                <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/10 text-center">
                    <h3 className="text-2xl font-bold mb-3">Ready to boost your academic success?</h3>
                    <p className="text-muted-foreground mb-6">
                        Join thousands of students using Vadea to organize, study, and excel.
                    </p>
                    <Link href="/signup">
                        <Button size="lg">Get Started Free</Button>
                    </Link>
                </div>
            </div>
        </article>
    )
}
