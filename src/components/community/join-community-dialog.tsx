"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Lock } from "lucide-react"
import { joinCommunity } from "@/app/actions/community"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JoinCommunityDialogProps {
    community: {
        id: string
        name: string
        description: string | null
        topic_tag: string | null
        is_public: boolean
        member_count?: number
    }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JoinCommunityDialog({ community, open, onOpenChange }: JoinCommunityDialogProps) {
    const [isJoining, setIsJoining] = useState(false)
    const router = useRouter()

    const handleJoin = async () => {
        setIsJoining(true)
        try {
            const result = await joinCommunity(community.id)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Joined ${community.name}!`)
                onOpenChange(false)
                router.refresh() // Refresh to update membership status
            }
        } catch (error) {
            toast.error('Failed to join community')
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Join {community.name}
                    </DialogTitle>
                    <DialogDescription>
                        Join this community to participate in discussions and access exclusive content
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Community Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <h4 className="font-semibold text-foreground mb-2">{community.name}</h4>
                        {community.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                                {community.description}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            {community.topic_tag && (
                                <Badge variant="outline" className="capitalize">
                                    {community.topic_tag}
                                </Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                                {community.is_public ? (
                                    <>
                                        <Users className="h-3 w-3" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3" />
                                        Private
                                    </>
                                )}
                            </Badge>
                            {community.member_count !== undefined && (
                                <Badge variant="outline">
                                    {community.member_count} members
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            What you'll get:
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                                <span>Access to community discussions and channels</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                                <span>Share posts, resources, and collaborate</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                                <span>Participate in live study sessions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                                <span>Connect with like-minded students</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isJoining}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoin}
                        disabled={isJoining}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        {isJoining ? 'Joining...' : 'Join Community'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
