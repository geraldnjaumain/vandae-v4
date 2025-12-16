import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '@/lib/blog'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
    title: 'Blog - Student Success Tips & Study Strategies',
    description: 'Expert advice on studying, productivity, time management, and academic success. Learn proven techniques to excel in college and beyond.',
    keywords: ['study tips', 'student blog', 'academic advice', 'productivity', 'learning strategies'],
    openGraph: {
        title: 'Vadea Blog - Study Tips & Academic Success',
        description: 'Expert advice on studying, productivity, and academic success',
        url: 'https://vadea.app/blog',
    },
}

export default async function BlogPage() {
    const posts = await getAllBlogPosts()

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Vadea Blog</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Expert tips, study strategies, and insights to help you succeed academically
                    </p>
                </div>

                {/* Featured Post */}
                {posts.length > 0 && (
                    <Link href={`/blog/${posts[0].slug}`}>
                        <Card className="mb-12 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="md:flex">
                                <div className="md:w-1/2 relative h-64 md:h-auto min-h-[300px]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                                    <Badge className="absolute top-4 left-4">Featured</Badge>
                                </div>
                                <CardHeader className="md:w-1/2">
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="secondary">{posts[0].category}</Badge>
                                    </div>
                                    <CardTitle className="text-3xl mb-3">{posts[0].title}</CardTitle>
                                    <CardDescription className="text-base mb-4">
                                        {posts[0].description}
                                    </CardDescription>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(posts[0].publishedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {posts[0].readingTime}
                                        </span>
                                    </div>
                                </CardHeader>
                            </div>
                        </Card>
                    </Link>
                )}

                {/* All Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.slice(1).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg" />
                                <CardHeader>
                                    <Badge variant="secondary" className="w-fit mb-2">
                                        {post.category}
                                    </Badge>
                                    <CardTitle className="text-xl">{post.title}</CardTitle>
                                    <CardDescription>{post.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(post.publishedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {post.readingTime}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
