"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Loader2, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { searchUsers, addMember } from "@/app/community/server-actions"
import { useDebounce } from "@/hooks/use-debounce"

interface InviteMemberDialogProps {
    communityId: string
    children?: React.ReactNode
}

export function InviteMemberDialog({ communityId, children }: InviteMemberDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<any[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [loadingMap, setLoadingMap] = React.useState<Record<string, boolean>>({})

    // Manual debounce since useDebounce hook might not be available or I'm too lazy to check
    // Actually simplicity first
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setIsSearching(true)
            try {
                const users = await searchUsers(query, communityId)
                setResults(users)
            } catch (error) {
                console.error(error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, communityId])

    const handleAdd = async (userId: string, name: string) => {
        setLoadingMap(prev => ({ ...prev, [userId]: true }))
        try {
            const result = await addMember(communityId, userId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Added ${name} to community`)
                // Remove from local list
                setResults(prev => prev.filter(u => u.id !== userId))
            }
        } catch (error) {
            toast.error("Failed to add member")
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invite
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users by name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
                        {isSearching ? (
                            <div className="flex items-center justify-center h-20 text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Searching...
                            </div>
                        ) : results.length > 0 ? (
                            results.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                            <div className="font-medium text-slate-900">{user.full_name}</div>
                                            {(user.university || user.major) && (
                                                <div className="text-xs text-slate-500">
                                                    {[user.university, user.major].filter(Boolean).join(" • ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={loadingMap[user.id]}
                                        onClick={() => handleAdd(user.id, user.full_name)}
                                    >
                                        {loadingMap[user.id] ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Add"
                                        )}
                                    </Button>
                                </div>
                            ))
                        ) : query.length >= 2 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No users found
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Type to search (min 2 chars)
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
