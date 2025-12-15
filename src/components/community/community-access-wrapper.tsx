"use client"

import { useState, useEffect } from "react"
import { JoinCommunityDialog } from "@/components/community/join-community-dialog"
import { ChatInterface } from "@/components/community/chat-interface"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface CommunityAccessWrapperProps {
    isMember: boolean
    community: any
    currentChannelId: string
    communityId: string
    userId: string
}

export function CommunityAccessWrapper({
    isMember,
    community,
    currentChannelId,
    communityId,
    userId
}: CommunityAccessWrapperProps) {
    const [showJoinDialog, setShowJoinDialog] = useState(false)

    // Show join dialog if not a member
    useEffect(() => {
        if (!isMember) {
            setShowJoinDialog(true)
        }
    }, [isMember])

    if (!isMember) {
        return (
            <>
                <div className="flex items-center justify-center h-full bg-muted/30">
                    <div className="text-center space-y-4 p-8">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">
                            Join to Participate
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            You need to join this community to view messages and participate in discussions.
                        </p>
                        <Button
                            onClick={() => setShowJoinDialog(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            Join {community.name}
                        </Button>
                    </div>
                </div>

                <JoinCommunityDialog
                    community={community}
                    open={showJoinDialog}
                    onOpenChange={setShowJoinDialog}
                />
            </>
        )
    }

    // User is a member, show chat
    return (
        <ChatInterface
            communityId={communityId}
            channelId={currentChannelId}
            channelName="General" // You can pass this as a prop if needed
            currentUserId={userId}
        />
    )
}
