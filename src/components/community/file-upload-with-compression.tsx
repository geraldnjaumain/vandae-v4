"use client"

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
    validateAndCompressFile,
    formatFileSize,
    isImage,
    isPDF,
} from '@/lib/file-compression'

interface FileWithMetadata {
    file: File
    originalSize: number
    compressedSize: number
    compressionRatio: number
    preview?: string
    status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
    error?: string
    uploadProgress?: number
}

interface FileUploadWithCompressionProps {
    onFilesSelected: (files: File[]) => void
    maxFiles?: number
    accept?: string
}

export function FileUploadWithCompression({
    onFilesSelected,
    maxFiles = 5,
    accept = 'image/*,application/pdf,.doc,.docx',
}: FileUploadWithCompressionProps) {
    const [files, setFiles] = useState<FileWithMetadata[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return

        const fileArray = Array.from(selectedFiles).slice(0, maxFiles - files.length)

        for (const file of fileArray) {
            // Add file with pending status
            const fileWithMeta: FileWithMetadata = {
                file,
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatio: 0,
                status: 'pending',
            }

            // Generate preview for images
            if (isImage(file)) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setFiles(prev => prev.map(f =>
                        f.file === file ? { ...f, preview: reader.result as string } : f
                    ))
                }
                reader.readAsDataURL(file)
            }

            setFiles(prev => [...prev, fileWithMeta])

            // Compress file
            setFiles(prev => prev.map(f =>
                f.file === file ? { ...f, status: 'compressing' } : f
            ))

            const result = await validateAndCompressFile(file)

            if (result.success && result.file && result.metadata) {
                setFiles(prev => prev.map(f =>
                    f.file === file ? {
                        ...f,
                        file: result.file!,
                        compressedSize: result.metadata!.compressedSize,
                        compressionRatio: result.metadata!.compressionRatio,
                        status: 'success',
                    } : f
                ))
            } else {
                setFiles(prev => prev.map(f =>
                    f.file === file ? {
                        ...f,
                        status: 'error',
                        error: result.error,
                    } : f
                ))
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpload = () => {
        const successfulFiles = files
            .filter(f => f.status === 'success')
            .map(f => f.file)
        onFilesSelected(successfulFiles)
    }

    const getFileIcon = (file: File) => {
        if (isImage(file)) return ImageIcon
        if (isPDF(file)) return FileText
        return File
    }

    const successfulFiles = files.filter(f => f.status === 'success')
    const hasErrors = files.some(f => f.status === 'error')

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-lg p-8
                    transition-all cursor-pointer
                    ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Images and PDFs up to 50MB (auto-compressed)
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        Max {maxFiles} files
                    </Badge>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((fileData, index) => {
                        const FileIcon = getFileIcon(fileData.file)

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                            >
                                {/* Preview or Icon */}
                                {fileData.preview ? (
                                    <img
                                        src={fileData.preview}
                                        alt="Preview"
                                        className="h-12 w-12 rounded object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">
                                        {fileData.file.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>{formatFileSize(fileData.originalSize)}</span>
                                        {fileData.status === 'success' && fileData.compressionRatio > 0 && (
                                            <>
                                                <span>→</span>
                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                    {formatFileSize(fileData.compressedSize)}
                                                </span>
                                                <Badge variant="secondary" className="text-xs h-4">
                                                    -{fileData.compressionRatio}%
                                                </Badge>
                                            </>
                                        )}
                                    </div>

                                    {/* Progress/Status */}
                                    {fileData.status === 'compressing' && (
                                        <div className="mt-2">
                                            <Progress value={undefined} className="h-1" />
                                            <p className="text-xs text-muted-foreground mt-1">Compressing...</p>
                                        </div>
                                    )}

                                    {fileData.status === 'error' && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            {fileData.error}
                                        </p>
                                    )}
                                </div>

                                {/* Status Icon */}
                                <div className="flex items-center gap-2">
                                    {fileData.status === 'compressing' && (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    )}
                                    {fileData.status === 'success' && (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    )}
                                    {fileData.status === 'error' && (
                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    )}

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeFile(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Upload Summary */}
            {files.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                        <span className="font-medium">{successfulFiles.length}</span> file(s) ready
                        {hasErrors && (
                            <span className="text-red-600 dark:text-red-400 ml-2">
                                ({files.filter(f => f.status === 'error').length} failed)
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={successfulFiles.length === 0}
                        size="sm"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Attach {successfulFiles.length} file(s)
                    </Button>
                </div>
            )}
        </div>
    )
}
