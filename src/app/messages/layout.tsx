import { AppLayout } from "@/components/layout"
import { createClient, getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ChatSidebar } from "@/components/messages/chat-sidebar"

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()
    if (!user) redirect('/login')

    const supabase = await createClient()

    // --- FETCH CHANNELS LOGIC (Moved from page.tsx) ---
    const { data: participations } = await supabase.from('direct_message_participants')
        .select(`
            dm_channel_id,
            direct_message_channels (
                updated_at,
                direct_messages (
                    content,
                    created_at,
                    is_read,
                    author_id
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const channelIds = participations?.map((p: any) => p.dm_channel_id) || []
    let channelsWithDetails: any[] = []

    if (channelIds.length > 0) {
        const { data: allParticipants } = await supabase.from('direct_message_participants')
            .select(`
                dm_channel_id,
                user_id,
                profiles:user_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .in('dm_channel_id', channelIds)

        const { data: lastMessages } = await supabase.from('direct_messages')
            .select('content, created_at, author_id, is_read, dm_channel_id')
            .in('dm_channel_id', channelIds)
            .order('created_at', { ascending: false })

        // Count unread
        const { data: unreadData } = await supabase.from('direct_messages')
            .select('dm_channel_id')
            .in('dm_channel_id', channelIds)
            .eq('is_read', false)
            .neq('author_id', user.id) // Only count messages from others

        const unreadCounts = (unreadData || []).reduce((acc: any, curr: any) => {
            acc[curr.dm_channel_id] = (acc[curr.dm_channel_id] || 0) + 1
            return acc
        }, {})

        channelsWithDetails = channelIds.map(cid => {
            const participants = allParticipants?.filter((p: any) => p.dm_channel_id === cid) || []
            const otherParticipant = participants.find((p: any) => p.user_id !== user.id)

            // Get LAST message for this channel
            const channelMessages = lastMessages?.filter((m: any) => m.dm_channel_id === cid) || []
            const lastMessage = channelMessages[0] || null

            if (!otherParticipant) return null

            return {
                id: cid,
                otherUser: otherParticipant.profiles,
                lastMessage: lastMessage,
                unreadCount: unreadCounts[cid] || 0,
                updatedAt: lastMessage ? new Date(lastMessage.created_at) : new Date(0)
            }
        }).filter(Boolean)

        // Sort by most recent activity
        channelsWithDetails.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    }
    // ------------------------------------------------

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
                {/* Sidebar - Desktop */}
                <ChatSidebar
                    channels={channelsWithDetails}
                    currentUserId={user.id}
                    className="hidden md:flex w-80 border-r border-border"
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                    {/* Mobile Sidebar Trigger - Absolute positioned or top bar? 
                        The [id] page has its own header. The empty page has none.
                        To avoid double headers, we should pass this responsibility to children 
                        OR have a unified header here.
                        
                        Let's put the mobile sidebar here, but it only renders the BUTTON.
                        The button will open the sheet from the left.
                    */}
                    <div className="md:hidden absolute top-4 right-4 z-50">
                        <ChatSidebar
                            channels={channelsWithDetails}
                            currentUserId={user.id}
                            className="md:hidden"
                        />
                    </div>

                    {children}
                </div>
            </div>
        </AppLayout>
    )
}
