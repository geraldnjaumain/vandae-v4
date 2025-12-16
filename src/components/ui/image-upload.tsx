"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-browser"

interface ImageUploadProps {
    value?: string
    onChange: (url: string | null) => void
    label?: string
    bucket?: string
}

export function ImageUpload({
    value,
    onChange,
    label = "Upload Image",
    bucket = "resources",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(value || null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB")
            return
        }

        setUploading(true)
        try {
            const supabase = createClient()

            // Get user ID
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to upload images")
                return
            }

            // Generate unique filename
            const fileExt = file.name.split(".").pop()
            const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })

            if (error) {
                console.error("Upload error:", error)
                toast.error("Failed to upload image")
                return
            }

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from(bucket).getPublicUrl(data.path)

            setPreview(publicUrl)
            onChange(publicUrl)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async () => {
        if (value && value.includes("supabase")) {
            try {
                const supabase = createClient()
                // Extract path from URL
                const pathMatch = value.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
                if (pathMatch) {
                    await supabase.storage.from(bucket).remove([pathMatch[1]])
                }
            } catch (error) {
                console.error("Failed to delete image:", error)
            }
        }

        setPreview(null)
        onChange(null)
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-60 rounded-lg border border-border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 gap-2"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                        Remove
                    </Button>
                </div>
            ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id={`image-upload-${label}`}
                    />
                    <label
                        htmlFor={`image-upload-${label}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Click to upload image
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </>
                        )}
                    </label>
                </div>
            )}
        </div>
    )
}
