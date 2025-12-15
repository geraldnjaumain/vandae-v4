"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPost } from "@/app/actions/community"
import { toast } from "sonner"
import { Send, Paperclip, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"

interface CreatePostFormProps {
    userCommunities: Array<{
        id: string
        name: string
    }>
}

export function CreatePostForm({ userCommunities }: CreatePostFormProps) {
    const [content, setContent] = React.useState("")
    const [selectedCommunity, setSelectedCommunity] = React.useState<string>("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [files, setFiles] = React.useState<File[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim() && files.length === 0) {
            toast.error("Post content cannot be empty")
            return
        }

        if (!selectedCommunity) {
            // Auto-select if only one option (should use default value prop but this works too) 
            if (userCommunities.length === 1) {
                // Should have been selected already if I set default state? check init.
                // It's safer to just error or auto-select.
                toast.error("Please select a community")
                return
            }
            toast.error("Please select a community")
            return
        }

        setIsSubmitting(true)
        const supabase = createClient()

        try {
            // Upload files first
            const uploadedUrls: string[] = []

            if (files.length > 0) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error("Not authenticated")

                for (const file of files) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                    const { error: uploadError } = await supabase.storage
                        .from('resources')
                        .upload(fileName, file)

                    if (uploadError) {
                        console.error('Upload Error:', uploadError)
                        if ((uploadError as any).message?.includes('Bucket not found') || (uploadError as any).error?.includes('Bucket not found')) {
                            throw new Error("Storage not configured: Please create a public bucket named 'resources' in your Supabase project.")
                        }
                        throw new Error(`Failed to upload ${file.name}`)
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('resources')
                        .getPublicUrl(fileName)

                    uploadedUrls.push(publicUrl)
                }
            }

            const result = await createPost(selectedCommunity, content.trim(), uploadedUrls)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Post created successfully!")
                setContent("")
                setFiles([])
                if (userCommunities.length > 1) setSelectedCommunity("") // Keep if single
                // Refresh the page logic is tricky with Next.js router vs window.reload. 
                // Server action usually handles revalidation.
                // window.location.reload() might be needed if optimistic update isn't enough.
                // But revalidatePath was called.
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create post. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Auto-select if single community passed
    React.useEffect(() => {
        if (userCommunities.length === 1) {
            setSelectedCommunity(userCommunities[0].id)
        }
    }, [userCommunities])

    if (userCommunities.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                        You haven't joined any communities yet.
                    </p>
                    <p className="text-xs text-gray-500">
                        Join communities that match your interests to start posting and connecting with classmates.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm">Create a Post</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Community Selector (only show if multiple) */}
                    {userCommunities.length > 1 && (
                        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a community" />
                            </SelectTrigger>
                            <SelectContent>
                                {userCommunities.map((community) => (
                                    <SelectItem key={community.id} value={community.id}>
                                        {community.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Content Textarea */}
                    <Textarea
                        placeholder="What's on your mind? Share with your community..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[100px] resize-none"
                        disabled={isSubmitting}
                    />

                    {/* File Previews */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="text-slate-500 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-900 gap-2 h-8"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting}
                            >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs">Attach Files</span>
                            </Button>
                            <span className="text-xs text-gray-400">
                                {content.length} chars
                            </span>
                        </div>

                        <Button type="submit" disabled={isSubmitting || (!content.trim() && files.length === 0) || !selectedCommunity}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
