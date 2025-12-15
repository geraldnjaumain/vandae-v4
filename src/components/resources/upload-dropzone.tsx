"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import { createResource } from "@/app/resources/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function UploadDropzone({ userId }: { userId: string }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) handleUpload(files[0])
    }

    const handleUpload = async (file: File) => {
        if (!file) return

        // 1. Validation (Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large (Max 10MB)")
            return
        }

        setIsUploading(true)
        const toastId = toast.loading("Uploading file...")

        try {
            // 2. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('vault')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 3. Save Metadata to DB via Server Action
            // Construct public URL or internal path?
            // Since it's a private bucket, we just store the path
            await createResource({
                title: file.name,
                file_url: filePath, // Storing path as 'url' for internal reference
                file_type: fileExt || 'unknown',
                file_size: file.size,
                file_path: filePath
            })

            toast.success("File uploaded successfully", { id: toastId })

        } catch (error: any) {
            console.error(error)
            toast.error("Upload failed: " + error.message, { id: toastId })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div
            className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50",
                isUploading && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])}
                ref={fileInputRef}
            />

            <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                ) : (
                    <Upload className={cn("h-10 w-10", isDragging ? "text-primary" : "text-slate-400")} />
                )}
                <div className="text-sm font-medium text-slate-700">
                    {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                </div>
                <div className="text-xs text-slate-500">
                    PDF, DOCX, Images up to 10MB
                </div>
            </div>
        </div>
    )
}
