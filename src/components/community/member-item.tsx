"use client"

import * as React from "react"
import { MoreVertical, Shield, ShieldAlert, UserMinus, User, MessageSquare } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateMemberRole, removeMember } from "@/app/community/server-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createOrGetDirectMessageChannel } from "@/app/messages/actions"
import { useRouter } from "next/navigation"

interface MemberItemProps {
    member: {
        role: string
        profiles: {
            id: string
            full_name: string
            avatar_url: string | null
        }
    }
    communityId: string
    isCurrentUserAdmin: boolean
    currentUserId: string
}

export function MemberItem({ member, communityId, isCurrentUserAdmin, currentUserId }: MemberItemProps) {
    const isMe = member.profiles.id === currentUserId
    const router = useRouter()

    const handleRoleChange = async (newRole: string) => {
        const promise = updateMemberRole(communityId, member.profiles.id, newRole as any)

        toast.promise(promise, {
            loading: 'Updating role...',
            success: 'Role updated successfully',
            error: 'Failed to update role'
        })
    }

    const handleKick = async () => {
        if (!confirm(`Are you sure you want to remove ${member.profiles.full_name} from the community?`)) return

        const promise = removeMember(communityId, member.profiles.id)

        toast.promise(promise, {
            loading: 'Removing member...',
            success: 'Member removed successfully',
            error: 'Failed to remove member'
        })
    }

    const handleMessage = async () => {
        try {
            toast.loading("Starting chat...")
            const result = await createOrGetDirectMessageChannel(member.profiles.id)
            toast.dismiss()
            router.push(`/messages/${result.id}`)
        } catch (error) {
            toast.error("Failed to start chat")
        }
    }

    return (
        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 group relative">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-700 ring-indigo-200' : 'bg-slate-200 text-slate-500 ring-transparent'}`}>
                <Avatar className="h-full w-full">
                    <AvatarImage src={member.profiles.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback>{member.profiles.full_name?.[0]}</AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-sm font-medium truncate ${member.role === 'admin' ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {member.profiles.full_name}
                </span>
                {member.role === 'admin' && <span className="text-[10px] text-indigo-500 font-semibold uppercase">Admin</span>}
            </div>

            {!isMe && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600" onClick={handleMessage} title="Message">
                        <MessageSquare className="h-4 w-4" />
                    </Button>

                    {isCurrentUserAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Change Role</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={member.role} onValueChange={handleRoleChange}>
                                            <DropdownMenuRadioItem value="admin">
                                                <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
                                                Admin
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="moderator">
                                                <Shield className="mr-2 h-4 w-4 text-slate-500" />
                                                Moderator
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="member">
                                                <User className="mr-2 h-4 w-4 text-slate-400" />
                                                Member
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleKick} className="text-red-600 focus:text-red-600">
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Kick Member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}
        </div>
    )
}
