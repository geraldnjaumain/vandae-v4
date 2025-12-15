import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getUser, getUserProfile } from "@/lib/supabase-server"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { PostCard } from "@/components/community/post-card"
import { CreatePostForm } from "@/components/community/create-post-form"
import { Users, Globe } from "lucide-react"
import { CreateCommunityDialog } from "@/components/community/create-community-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

async function getCommunityData(userId: string, userInterests: string[]) {
    const supabase: any = await createClient()

    // 1. Get User Memberships (My Communities)
    const { data: memberships } = await supabase
        .from('community_members')
        .select(`
            community_id, 
            communities (id, name, member_count, description, topic_tag)
        `)
        .eq('user_id', userId)

    const userCommunities = memberships?.map((m: any) => ({
        id: m.communities!.id,
        name: m.communities!.name,
        memberCount: m.communities!.member_count,
        description: m.communities!.description,
        topicTag: m.communities!.topic_tag
    })) || []

    const memberIds = userCommunities.map((c: any) => c.id)

    // 2. Get all public communities for discovery
    const { data: allPublicCommunities } = await supabase
        .from('communities')
        .select('id, name, member_count, description, topic_tag, is_private')
        .eq('is_private', false)
        .order('member_count', { ascending: false })
        .limit(20)

    const discoverCommunities = (allPublicCommunities || [])
        .filter((c: any) => !memberIds.includes(c.id))

    // 3. Find communities matching interests (Discovery)
    let interestCommunityIds: string[] = []
    if (userInterests && userInterests.length > 0) {
        const { data: communities } = await supabase
            .from('communities')
            .select('id')
            .in('topic_tag', userInterests)
        interestCommunityIds = communities?.map((c: any) => c.id) || []
    }

    // 4. Combine IDs for Feed (Memberships + Interests)
    const allCommunityIds = Array.from(new Set([...memberIds, ...interestCommunityIds]))

    // 5. Fetch Posts
    let posts: any[] = []
    if (allCommunityIds.length > 0) {
        const { data, error: postsError } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                likes_count,
                comments_count,
                created_at,
                author_id,
                community_id,
                attachments,
                is_pinned,
                profiles:author_id (
                    id,
                    full_name,
                    avatar_url
                ),
                communities:community_id (
                    id,
                    name
                )
            `)
            .in('community_id', allCommunityIds)
            .order('created_at', { ascending: false })
            .limit(50)

        if (!postsError && data) {
            posts = data
        }
    }

    // 6. Get Likes
    const postIds = posts.map(p => p.id)
    let likedPostIds = new Set()

    if (postIds.length > 0) {
        const { data: userLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', postIds)
        likedPostIds = new Set(userLikes?.map((l: any) => l.post_id) || [])
    }

    return {
        userCommunities,
        discoverCommunities,
        posts,
        userLikes: likedPostIds
    }
}

export default async function CommunityPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getUserProfile()
    if (!profile) redirect('/onboarding')

    const userInterests = (profile as any).interests || []
    const { userCommunities, discoverCommunities, posts, userLikes } = await getCommunityData(user.id, userInterests)

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <Typography variant="h1" className="flex items-center gap-2">
                            <Users className="h-8 w-8 text-indigo-600" />
                            Community
                        </Typography>
                        <Typography variant="muted">
                            Connect with classmates and join study groups
                        </Typography>
                    </div>
                    <CreateCommunityDialog />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* No Interests Warning */}
                        {userInterests.length === 0 && userCommunities.length === 0 && (
                            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900/50">
                                <CardContent className="py-4 flex items-start gap-3">
                                    <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-amber-900 dark:text-amber-200">Your feed is empty</p>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">
                                            <Link href="/settings" className="underline hover:text-amber-900 dark:hover:text-amber-100">Add interests to your profile</Link> to see relevant communities instantly.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <CreatePostForm userCommunities={userCommunities} />

                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">No posts to display</p>
                                    <p className="text-xs text-muted-foreground">Be the first to post!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        currentUserId={user.id}
                                        initialIsLiked={userLikes.has(post.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* My Communities */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    My Communities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {userCommunities.length === 0 ? (
                                    <div className="text-center py-4 space-y-2">
                                        <p className="text-sm text-muted-foreground">No memberships yet.</p>
                                        <p className="text-xs text-muted-foreground">Browse below to join!</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {userCommunities.map((c: any) => (
                                            <Link href={`/community/${c.id}`} key={c.id} className="block">
                                                <li className="flex items-center justify-between group cursor-pointer hover:bg-accent p-2 -mx-2 rounded-lg transition-all duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                                                            {c.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{c.memberCount} members</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Discover Communities */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Discover Communities
                                </CardTitle>
                                <CardDescription className="text-xs">Public communities you can join</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {discoverCommunities.length === 0 ? (
                                    <div className="text-center py-4 space-y-2">
                                        <p className="text-sm text-muted-foreground">No communities to discover.</p>
                                        <p className="text-xs text-muted-foreground">Create one to get started!</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {discoverCommunities.slice(0, 5).map((c: any) => (
                                            <Link href={`/community/${c.id}`} key={c.id} className="block">
                                                <li className="group cursor-pointer hover:bg-accent p-3 -mx-3 rounded-lg transition-all duration-200">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm shrink-0">
                                                            {c.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">{c.name}</p>
                                                            {c.description && (
                                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="text-[10px] text-muted-foreground">{c.member_count} members</span>
                                                                {c.topic_tag && (
                                                                    <Badge variant="outline" className="text-[10px] h-4">{c.topic_tag}</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Your Interests */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Your Interests</h4>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {userInterests.map((tag: any) => (
                                            <span key={tag} className="px-2 py-1 bg-muted text-foreground text-xs rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                        {userInterests.length === 0 && (
                                            <Link href="/settings" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                Add interests in Settings
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
