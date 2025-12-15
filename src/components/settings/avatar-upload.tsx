"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { updateProfile } from "@/app/settings/actions"

interface AvatarUploadProps {
    userId: string
    currentAvatarUrl?: string | null
    displayName: string
    onUploadComplete: (newUrl: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, displayName, onUploadComplete }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("Image size must be less than 2MB")
            return
        }

        setIsUploading(true)
        const supabase = createClient()

        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `${userId}-${Math.random()}.${fileExt}`

            // 1. Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // 3. Update Profile (via parent or direct action)
            // We'll let the parent handle the full profile update or do partial here?
            // The prop says `onUploadComplete`, let's just callback.
            // Actually, we should probably save it to be safe.
            onUploadComplete(publicUrl)

        } catch (error: any) {
            toast.error("Failed to upload avatar: " + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={currentAvatarUrl || ""} />
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                    {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Change Avatar
                        </>
                    )}
                </Button>
                <p className="text-[10px] text-slate-500">
                    Max 2MB. JPG, GIF, or PNG.
                </p>
            </div>
        </div>
    )
}
