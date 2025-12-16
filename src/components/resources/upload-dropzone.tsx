"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import { createResource } from "@/app/resources/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import compression utility
import { compressFile, formatFileSize } from "@/lib/file-compression"

export function UploadDropzone({ userId }: { userId: string }) {
    const [isDragging, setIsDragging] = useState(false)
    // Add compression state
    const [isCompressing, setIsCompressing] = useState(false)
    const [compressionProgress, setCompressionProgress] = useState(0)
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

    const handleUpload = async (originalFile: File) => {
        if (!originalFile) return

        // 1. Validation (Max 50MB - increased to allow larger pre-compression files)
        if (originalFile.size > 50 * 1024 * 1024) {
            toast.error("File is too large (Max 50MB)")
            return
        }

        try {
            // COMPRESSION STEP
            setIsCompressing(true)
            toast.info("Optimizing file...", { duration: 2000 })

            const { compressedFile, originalSize, compressedSize, compressionRatio } = await compressFile(originalFile)

            setIsCompressing(false)

            if (compressionRatio > 0) {
                const reduction = formatFileSize(originalSize - compressedSize)
                toast.success(`Compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${reduction} saved)`)
            }

            const fileToUpload = compressedFile

            setIsUploading(true)
            const toastId = toast.loading("Uploading file...")

            // 2. Upload to Supabase Storage
            const fileExt = fileToUpload.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('vault')
                .upload(filePath, fileToUpload)

            if (uploadError) throw uploadError

            // 3. Save Metadata to DB via Server Action
            await createResource({
                title: originalFile.name, // Keep original name
                file_url: filePath, // Storing path as 'url' for internal reference
                file_type: fileExt || 'unknown',
                file_size: fileToUpload.size,
                file_path: filePath
            })

            toast.success("File uploaded successfully", { id: toastId })

        } catch (error: any) {
            console.error(error)
            toast.error("Upload failed: " + error.message)
        } finally {
            setIsUploading(false)
            setIsCompressing(false)
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
