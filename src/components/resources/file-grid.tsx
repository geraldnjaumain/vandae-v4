"use client"

import { Resource, deleteResource } from "@/app/resources/actions"
import { FileText, Image as ImageIcon, MoreVertical, Trash, Download, File, Music, Video, Brain, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase-browser"
import { toast } from "sonner"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAIStore } from "@/lib/stores/ai-store"

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getFileIcon(type: string) {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <ImageIcon className="h-6 w-6 text-purple-500" />
    if (['pdf'].includes(type)) return <FileText className="h-6 w-6 text-red-500" />
    if (['mp3', 'wav'].includes(type)) return <Music className="h-6 w-6 text-pink-500" />
    if (['mp4', 'mov'].includes(type)) return <Video className="h-6 w-6 text-blue-500" />
    return <File className="h-6 w-6 text-slate-500" />
}

import { ResourceViewer } from "@/components/resources/resource-viewer"

export function FileGrid({ resources }: { resources: Resource[] }) {
    if (resources.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>No files uploaded yet.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((file) => (
                <FileCard key={file.id} file={file} />
            ))}
        </div>
    )
}

function FileCard({ file }: { file: Resource }) {
    const [isLoading, setIsLoading] = useState(false)
    const [viewResource, setViewResource] = useState<Resource | null>(null)
    const supabase = createClient()
    const { toggleFile, isAttached } = useAIStore()
    const attached = isAttached(file.id)

    const handleDownload = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase.storage
                .from('vault')
                .createSignedUrl(file.file_url, 60) // 60 seconds valid

            if (error) throw error
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank')
            }
        } catch (error: any) {
            toast.error("Download failed: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this file?")) return
        const toastId = toast.loading("Deleting...")
        try {
            await deleteResource(file.id, file.file_url)
            toast.success("File deleted", { id: toastId })
        } catch (error: any) {
            toast.error("Delete failed: " + error.message, { id: toastId })
        }
    }

    const handleToggleAI = () => {
        toggleFile(file.id)
        if (!attached) {
            toast.success("Added to AI Context", {
                description: "The AI Advisor can now read this file."
            })
        } else {
            toast.info("Removed from AI Context")
        }
    }

    return (
        <>
            <div className={cn(
                "group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all flex items-start justify-between cursor-pointer",
                attached ? "ring-2 ring-primary border-transparent shadow-sm bg-primary/5" : "border-slate-200"
            )}
            onClick={() => setViewResource(file)}
            >
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                        {getFileIcon(file.file_type)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate max-w-[120px] sm:max-w-[160px]" title={file.title}>
                            {file.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                                {formatBytes(file.file_size)}
                            </span>
                            {attached && (
                                <span className="flex items-center gap-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    <Brain className="h-3 w-3" />
                                    Context
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewResource(file)}>
                                <File className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleAI}>
                                {attached ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        Attached
                                    </>
                                ) : (
                                    <>
                                        <Brain className="mr-2 h-4 w-4 text-primary" />
                                        Attach to AI
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <ResourceViewer 
                resource={viewResource} 
                isOpen={!!viewResource} 
                onClose={() => setViewResource(null)} 
            />
        </>
    )
}
