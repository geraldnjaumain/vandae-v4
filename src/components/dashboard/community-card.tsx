"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Typography } from "@/components/ui/typography"
import { Users, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { formatDistance } from "date-fns"

interface Post {
    id: string
    content: string
    likes_count: number
    comments_count: number
    created_at: string
    profiles: {
        id: string
        full_name: string
        avatar_url: string | null
    } | null
    communities: {
        id: string
        name: string
    } | null
}

interface CommunityCardProps {
    post: Post | null
}

export function CommunityCard({ post }: CommunityCardProps) {
    if (!post) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Community Highlights
                    </CardTitle>
                    <CardDescription>Popular in your communities</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Typography variant="small" className="font-medium">
                            No community activity
                        </Typography>
                        <Typography variant="muted" className="text-xs">
                            Join communities matching your interests to see posts
                        </Typography>
                    </div>
                    <Link href="/community">
                        <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Explore Communities
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    const postedAgo = formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })

    return (
        <Link href={`/community/${post.communities?.id}?channel=general`} className="block h-full group">
            <Card className="h-full flex flex-col group-hover:border-indigo-200 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Community Highlights
                    </CardTitle>
                    <CardDescription>From {post.communities?.name || 'Community'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-4">
                        {/* Author Info */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center text-foreground font-semibold text-sm">
                                {post.profiles?.full_name?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Typography variant="small" className="font-medium">
                                    {post.profiles?.full_name || 'Anonymous'}
                                </Typography>
                                <Typography variant="muted" className="text-xs">
                                    {postedAgo}
                                </Typography>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1">
                            <Typography variant="p" className="text-sm line-clamp-4">
                                {post.content}
                            </Typography>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4 pt-2 border-t border-notion-border">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments_count}</span>
                            </div>
                            {post.communities && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                    {post.communities.name}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
