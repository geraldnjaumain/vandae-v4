"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Hash, Volume2, Pin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createChannel } from "@/app/community/server-actions"

interface CreateChannelDialogProps {
    communityId: string
    children?: React.ReactNode
}

export function CreateChannelDialog({ communityId, children }: CreateChannelDialogProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [type, setType] = React.useState<'text' | 'voice' | 'announcement'>('text')
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const result = await createChannel(communityId, name, type)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Channel created successfully")
                setIsOpen(false)
                setName("")
                setType('text')
            }
        } catch (error) {
            toast.error("Failed to create channel")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-slate-200 rounded-sm">
                        <Plus className="h-3 w-3 text-slate-500" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Channel Type</Label>
                        <RadioGroup value={type} onValueChange={(v: string) => setType(v as 'text' | 'voice' | 'announcement')} className="grid grid-cols-1 gap-2">
                            <Label className={`flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition-colors ${type === 'text' ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <Hash className="h-5 w-5 text-slate-500" />
                                    <div className="space-y-0.5">
                                        <span className="font-medium block">Text</span>
                                        <span className="text-xs text-slate-500 font-normal">Send messages, images, and files</span>
                                    </div>
                                </div>
                                <RadioGroupItem value="text" id="text" className="sr-only" />
                            </Label>

                            <Label className={`flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition-colors ${type === 'voice' ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <Volume2 className="h-5 w-5 text-slate-500" />
                                    <div className="space-y-0.5">
                                        <span className="font-medium block">Voice</span>
                                        <span className="text-xs text-slate-500 font-normal">Hang out together with voice and video</span>
                                    </div>
                                </div>
                                <RadioGroupItem value="voice" id="voice" className="sr-only" />
                            </Label>

                            <Label className={`flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition-colors ${type === 'announcement' ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <Pin className="h-5 w-5 text-slate-500" />
                                    <div className="space-y-0.5">
                                        <span className="font-medium block">Announcement</span>
                                        <span className="text-xs text-slate-500 font-normal">Post updates and news (Read-only for others)</span>
                                    </div>
                                </div>
                                <RadioGroupItem value="announcement" id="announcement" className="sr-only" />
                            </Label>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Channel Name</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-slate-400">
                                {type === 'text' && <Hash className="h-4 w-4" />}
                                {type === 'voice' && <Volume2 className="h-4 w-4" />}
                                {type === 'announcement' && <Pin className="h-4 w-4" />}
                            </div>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                                placeholder="new-channel"
                                className="pl-9"
                                maxLength={25}
                            />
                        </div>
                        <p className="text-xs text-slate-500">Only lowercase letters, numbers, and hyphens.</p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={!name.trim() || isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Channel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
