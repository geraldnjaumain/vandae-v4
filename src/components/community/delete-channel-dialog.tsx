"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { deleteChannel } from "@/app/community/server-actions"

interface DeleteChannelDialogProps {
    channelId: string
    communityId: string
    channelName: string
    children: React.ReactNode
}

export function DeleteChannelDialog({
    channelId,
    communityId,
    channelName,
    children,
}: DeleteChannelDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await deleteChannel(channelId, communityId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Channel #${channelName} deleted`)
                setOpen(false)
            }
        } catch (error) {
            toast.error("Failed to delete channel")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-semibold text-slate-900">#{channelName}</span>? This action cannot be undone and all messages will be lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
