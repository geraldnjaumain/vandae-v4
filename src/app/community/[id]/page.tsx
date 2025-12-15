import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Users,
    MessageSquare,
    Video,
    FileText,
    ArrowLeft,
    Settings,
    Share2,
    Hash,
    Pin,
    Volume2
} from "lucide-react"
import Link from "next/link"
import { createClient, getUser, getUserProfile } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { getCommunityDetails } from "@/app/community/actions"
import { CreatePostForm } from "@/components/community/create-post-form"
import { PostCard } from "@/components/community/post-card"
import { JitsiMeet } from "@/components/community/jitsi-meet"
import { ChatInterface } from "@/components/community/chat-interface"
import { CreateChannelDialog } from "@/components/community/create-channel-dialog"
import { ChannelList } from "@/components/community/channel-list"
import { MobileChannelList } from "@/components/community/mobile-channel-list"
import { MemberItem } from "@/components/community/member-item"
import { StudyRoomTools } from "@/components/community/study-room-tools"
import { InviteMemberDialog } from "@/components/community/invite-member-dialog"
import { CommunityAccessWrapper } from "@/components/community/community-access-wrapper"

export default async function CommunityDetailPage(props: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ channel?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id } = params

    // Default to 'general' if no channel specified, but ideally we find the first channel
    // We'll handle this after fetching channels
    const requestedChannelName = searchParams.channel

    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getUserProfile()
    if (!profile) redirect('/onboarding')

    const details = await getCommunityDetails(id)

    if (!details) {
        return (
            <AppLayout>
                <div className="container mx-auto p-6 text-center">
                    <Typography variant="h2">Community Not Found</Typography>
                    <Link href="/community">
                        <Button variant="link">Return to Communities</Button>
                    </Link>
                </div>
            </AppLayout>
        )
    }

    const { community, posts } = details

    // Fetch Channels
    const supabase = await createClient()
    const { data: channels } = await supabase
        .from('channels')
        .select('*')
        .eq('community_id', id)
        .order('position', { ascending: true })

    // If no channels exist (legacy), default to internal logic
    const channelList = channels && channels.length > 0 ? channels : [
        { id: 'general', name: 'general', type: 'text' },
        { id: 'announcements', name: 'announcements', type: 'announcement' },
        { id: 'resources', name: 'resources', type: 'text' }, // Treated as special tab previously
    ]

    // Determine current active channel
    const currentChannel = channelList.find(c => c.name === requestedChannelName) || channelList[0]
    const currentChannelId = currentChannel.id

    // Fetch User Role and Check Membership
    const { data: memberData } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single()

    const isMember = !!memberData
    const userRole = memberData?.role || 'member'
    const isCommunityAdmin = userRole === 'admin'

    // Fetch All Members (for sidebar)
    const { data: members } = await supabase
        .from('community_members')
        .select(`
            role,
            profiles:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('community_id', id)
        .order('role', { ascending: true }) // Admin first roughly

    // Filter Posts based on Channel for "Announcements" mode (legacy Feed)
    let filteredPosts = posts
    if (currentChannel.type === 'announcement') {
        filteredPosts = posts.filter((p: any) => p.is_pinned || true) // Show all posts for now in announcement channel if using Feed
    }

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
                {/* Community Sidebar (Discord Style) */}
                <div className="w-64 bg-muted/10 border-r border-border hidden md:flex flex-col shrink-0">
                    <div className="p-4 border-b border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-lg truncate text-foreground">{community.name}</h2>
                            {community.is_private && <Badge variant="secondary" className="text-[10px]">Private</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{community.member_count} members</p>
                    </div>

                    <ScrollArea className="flex-1 p-3">
                        <ChannelList
                            communityId={id}
                            channels={channelList as any[]}
                            currentChannelId={currentChannelId}
                            isCommunityAdmin={isCommunityAdmin}
                        />
                    </ScrollArea>

                    <div className="p-4 border-t border-border bg-muted/30">
                        <Link href="/community">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to All
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    {/* Channel Header */}
                    <div className="h-14 border-b border-border pl-4 pr-16 md:px-6 flex items-center justify-between shrink-0 bg-background shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 md:hidden">
                                <Link href="/community">
                                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                                </Link>
                                <MobileChannelList
                                    communityId={id}
                                    communityName={community.name}
                                    channels={channelList as any[]}
                                    currentChannelId={currentChannelId}
                                    isCommunityAdmin={isCommunityAdmin}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {currentChannel.type === 'announcement' ? <Pin className="h-5 w-5 text-muted-foreground" /> :
                                    currentChannel.type === 'voice' ? <Volume2 className="h-5 w-5 text-muted-foreground" /> :
                                        <Hash className="h-5 w-5 text-muted-foreground" />
                                }
                                <h3 className="font-bold text-foreground">{currentChannel.name}</h3>
                                {currentChannel.type === 'announcement' && (
                                    <Badge variant="outline" className="ml-2 text-xs font-normal">Read-only</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Mobile Channel Menu could go here */}
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <Users className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {currentChannel.type === 'text' && (
                            <CommunityAccessWrapper
                                isMember={isMember}
                                community={community}
                                currentChannelId={currentChannel.id}
                                communityId={id}
                                userId={user.id}
                            />
                        )}

                        {currentChannel.type === 'announcement' && (
                            <div className="h-full overflow-y-auto p-6 bg-muted/10">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {isCommunityAdmin && (
                                        <CreatePostForm userCommunities={[{ id: community.id, name: community.name }]} />
                                    )}
                                    <div className="space-y-4">
                                        {posts.map((post: any) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                currentUserId={user.id}
                                                currentCommunityId={community.id}
                                                isCommunityAdmin={isCommunityAdmin}
                                            />
                                        ))}
                                        {posts.length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground">
                                                No announcements yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(currentChannel.type === 'voice' || currentChannel.name === 'study-room') && (
                            <div className="h-full bg-slate-950 flex">
                                <div className="flex-1 flex flex-col relative">
                                    <iframe
                                        src={`https://meet.jit.si/${community.id}-${currentChannel.name}`}
                                        className="flex-1 w-full border-0"
                                        allow="camera; microphone; fullscreen; display-capture; clipboard-read; clipboard-write;"
                                    />
                                </div>
                                {currentChannel.name === 'study-room' && <StudyRoomTools />}
                            </div>
                        )}

                        {/* Fallback for Resources tab if still needed or moved to a channel */}
                    </div>
                </div>

                {/* Member Sidebar (Optional Discord feature) - Hidden on mobile, shown on large screens */}
                <div className="w-60 bg-muted/10 border-l border-border hidden lg:flex flex-col shrink-0">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <span className="font-semibold text-sm text-muted-foreground">Members — {(members || []).length}</span>
                        {isCommunityAdmin && (
                            <InviteMemberDialog communityId={id}>
                                <Button variant="ghost" size="icon" className="h-6 w-6" title="Add Member">
                                    <Users className="h-4 w-4 text-muted-foreground hover:text-indigo-600" />
                                    <span className="sr-only">Add Member</span>
                                </Button>
                            </InviteMemberDialog>
                        )}
                    </div>
                    <ScrollArea className="flex-1 p-3">
                        <div className="space-y-1">
                            {(members || []).map((member: any) => (
                                <MemberItem
                                    key={member.profiles.id}
                                    member={member}
                                    communityId={id}
                                    isCurrentUserAdmin={isCommunityAdmin}
                                    currentUserId={user.id}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </AppLayout>
    )
}
