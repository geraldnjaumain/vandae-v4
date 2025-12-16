import { createClient, getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DMChatInterface } from "@/components/messages/dm-chat-interface"

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
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/50">
            {/* Header */}
            <div className="h-16 border-b border-border bg-background px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="md:hidden">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>

                    {otherMember ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={otherMember.avatar_url || undefined} />
                                    <AvatarFallback>{otherMember.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground text-sm leading-none mb-1">{otherMember.full_name}</h2>
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    Online
                                </span>
                            </div>
                        </div>
                    ) : (
                        <h2 className="font-bold">Unknown User</h2>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Video className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
                <DMChatInterface
                    channelId={id}
                    currentUserId={user.id}
                    otherUserId={otherMember?.id}
                />
            </div>
        </div>
    )
}
