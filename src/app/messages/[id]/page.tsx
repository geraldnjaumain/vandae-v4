import { AppLayout } from "@/components/layout"
import { createClient, getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/community/chat-interface"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DMChannelPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params
    const user = await getUser()
    if (!user) redirect('/login')

    const supabase = await createClient()

    // Verify membership and get other user details
    const { data: participants, error } = await supabase.from('direct_message_participants')
        .select(`
            user_id,
            profiles:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('dm_channel_id', id)

    if (error || !participants) {
        redirect('/messages') // Or 404
    }

    const isMember = participants.some((p: any) => p.user_id === user.id)
    if (!isMember) {
        redirect('/messages') // Unauthorized
    }

    const participant = participants.find((p: any) => p.user_id !== user.id)
    const otherMemberData = participant?.profiles
    const otherMember = Array.isArray(otherMemberData) ? otherMemberData[0] : otherMemberData

    return (
        <AppLayout>
            <div className="h-[calc(100vh-64px)] flex flex-col bg-muted/30">
                {/* Header */}
                <div className="h-16 border-b border-border bg-background px-6 flex items-center gap-4 shrink-0 shadow-sm z-10">
                    <Link href="/messages">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>

                    {otherMember ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={otherMember.avatar_url || undefined} />
                                <AvatarFallback>{otherMember.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold text-foreground leading-none">{otherMember.full_name}</h2>
                                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    ) : (
                        <h2 className="font-bold">Unknown User</h2>
                    )}
                </div>

                {/* Chat Interface - Reusing existing component but we need to adapt it slightly 
                    The existing ChatInterface takes 'communityId' and 'channelId'. 
                    For DMs, we don't have a communityId.
                    
                    OPTION: We can update ChatInterface to accept an optional 'isDM' flag 
                    and handle the message fetching/subscription logic differently if it is a DM. 
                    Given I cannot deeply refactor ChatInterface right now without risk, 
                    I will create a WRAPPER or specialized DM verison if needed. 
                    
                    However, looking at ChatInterface source (I remember viewing it), 
                    it likely queries 'messages' table. DMs are in 'direct_messages'.
                    
                    So I absolutely need a `DMChatInterface` or huge refactor.
                    Refactoring usually cleaner. 
                    Let's create `src/components/messages/dm-chat-interface.tsx`.
                */}
                <div className="flex-1 overflow-hidden">
                    <DMChatInterface
                        channelId={id}
                        currentUserId={user.id}
                        otherUserId={otherMember?.id}
                    />
                </div>
            </div>
        </AppLayout>
    )
}

import { DMChatInterface } from "@/components/messages/dm-chat-interface"
