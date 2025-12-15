import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { createClient, getUser, getUserProfile } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Users, Mail } from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export default async function MessagesPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const supabase = await createClient()

    // Fetch user's message channels
    const { data: participations } = await supabase.from('direct_message_participants')
        .select(`
            dm_channel_id,
            direct_message_channels (
                updated_at,
                direct_messages (
                    content,
                    created_at,
                    is_read
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) // Sort by participation creation or channel update?

    // We need to fetch the OTHER participant for each channel
    // This is tricky in one query. Let's get the channel IDs first.
    const channelIds = participations?.map((p: any) => p.dm_channel_id) || []

    let channelsWithDetails: any[] = []

    if (channelIds.length > 0) {
        // Fetch all participants for these channels
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

        // Fetch last message for each channel
        const { data: lastMessages } = await supabase.from('direct_messages')
            .select('*')
            .in('dm_channel_id', channelIds)
            .order('created_at', { ascending: false })

        // Fetch unread counts
        const { data: unreadData } = await supabase.from('direct_messages')
            .select('dm_channel_id')
            .in('dm_channel_id', channelIds)
            .eq('is_read', false)
            .neq('author_id', user.id)

        // Count per channel
        const unreadCounts = (unreadData || []).reduce((acc: any, curr: any) => {
            acc[curr.dm_channel_id] = (acc[curr.dm_channel_id] || 0) + 1
            return acc
        }, {})

        // Group logic
        channelsWithDetails = channelIds.map(cid => {
            const participants = allParticipants?.filter((p: any) => p.dm_channel_id === cid) || []
            const otherParticipant = participants.find((p: any) => p.user_id !== user.id)
            const messages = lastMessages?.filter((m: any) => m.dm_channel_id === cid) || []
            const lastMessage = messages[0]

            if (!otherParticipant) return null // Should not happen for valid DMs

            return {
                id: cid,
                otherUser: otherParticipant.profiles,
                lastMessage: lastMessage,
                unreadCount: unreadCounts[cid] || 0
            }
        }).filter(Boolean)

        // Sort by last message time
        channelsWithDetails.sort((a, b) => {
            const timeA = new Date(a.lastMessage?.created_at || 0).getTime()
            const timeB = new Date(b.lastMessage?.created_at || 0).getTime()
            return timeB - timeA
        })
    }

    return (
        <AppLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <Typography variant="h1" className="flex items-center gap-2">
                        <Mail className="h-8 w-8 text-indigo-600" />
                        Messages
                    </Typography>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {channelsWithDetails.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p>No messages yet.</p>
                                <p className="text-xs">Visit a community to start chatting with members.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {channelsWithDetails.map((channel) => (
                                    <Link key={channel.id} href={`/messages/${channel.id}`} className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${channel.unreadCount > 0 ? 'bg-indigo-50/50' : ''}`}>
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={channel.otherUser.avatar_url} />
                                                <AvatarFallback>{channel.otherUser.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            {channel.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                                    {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-semibold truncate ${channel.unreadCount > 0 ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                    {channel.otherUser.full_name}
                                                </h3>
                                                {channel.lastMessage && (
                                                    <span className={`text-xs whitespace-nowrap ml-2 ${channel.unreadCount > 0 ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                                                        {formatDistanceToNow(new Date(channel.lastMessage.created_at), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${channel.unreadCount > 0 ? 'text-indigo-800 font-medium' : 'text-slate-500'}`}>
                                                {channel.lastMessage ? (
                                                    <>
                                                        {channel.lastMessage.author_id === user.id && "You: "}
                                                        {channel.lastMessage.content}
                                                    </>
                                                ) : (
                                                    <span className="italic">No messages yet</span>
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
