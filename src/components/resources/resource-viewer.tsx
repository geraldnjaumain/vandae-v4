"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, ExternalLink, FileText, Play, Music, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useState, useEffect } from "react"
import { Resource } from "@/app/resources/actions"

interface ResourceViewerProps {
    resource: Resource | null
    isOpen: boolean
    onClose: () => void
}

export function ResourceViewer({ resource, isOpen, onClose }: ResourceViewerProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [textContent, setTextContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (resource && isOpen) {
            const loadContent = async () => {
                setIsLoading(true)
                setTextContent(null)

                // 1. Get Signed URL
                const { data } = await supabase.storage
                    .from('vault')
                    .createSignedUrl(resource.file_url, 3600)

                if (data?.signedUrl) {
                    setSignedUrl(data.signedUrl)

                    // 2. If Text/Code, fetch content
                    const type = resource.file_type.toLowerCase()
                    if (['txt', 'md', 'json', 'ts', 'tsx', 'js', 'css', 'html', 'py', 'java', 'c', 'cpp', 'h', 'csv'].includes(type)) {
                        try {
                            const res = await fetch(data.signedUrl)
                            const text = await res.text()
                            setTextContent(text)
                        } catch (e) {
                            console.error("Failed to fetch text content", e)
                        }
                    }
                }
                setIsLoading(false)
            }
            loadContent()
        } else {
            setSignedUrl(null)
            setTextContent(null)
        }
    }, [resource, isOpen])

    if (!resource) return null

    const fileType = resource.file_type.toLowerCase()

    // Determine viewer type
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)
    const isPdf = ['pdf'].includes(fileType)
    const isVideo = ['mp4', 'mov', 'webm', 'mkv'].includes(fileType)
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(fileType)
    const isText = ['txt', 'md', 'json', 'ts', 'tsx', 'js', 'css', 'html', 'py', 'java', 'c', 'cpp', 'h', 'csv', 'sql', 'env'].includes(fileType)
    const isOffice = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileType)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-none bg-[#0a0a0a] backdrop-blur-xl [&_[data-close-icon]]:hidden shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-5 py-4 border-b border-white/10 shrink-0 flex flex-row items-center justify-between space-y-0 bg-white/5">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2.5 bg-white/10 rounded-xl shrink-0 backdrop-blur-md">
                            {isImage ? <ImageIcon className="h-5 w-5 text-purple-400" /> :
                                isPdf ? <FileText className="h-5 w-5 text-red-400" /> :
                                    isVideo ? <Play className="h-5 w-5 text-blue-400" /> :
                                        isAudio ? <Music className="h-5 w-5 text-pink-400" /> :
                                            isText ? <FileText className="h-5 w-5 text-yellow-400" /> :
                                                isOffice ? <FileText className="h-5 w-5 text-orange-400" /> :
                                                    <FileText className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <DialogTitle className="text-lg font-medium text-white truncate pr-4">
                                {resource.title}
                            </DialogTitle>
                            <p className="text-xs text-white/50 font-mono mt-0.5">
                                {resource.file_type.toUpperCase()} • {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {signedUrl && (
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full" asChild>
                                <a href={signedUrl} download target="_blank" rel="noopener noreferrer" title="Download">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-red-500/80 transition-colors rounded-full" onClick={onClose} title="Close">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#050505]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 text-white/50">
                            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Loading content...</span>
                        </div>
                    ) : signedUrl ? (
                        <>
                            {isImage && (
                                <img
                                    src={signedUrl}
                                    alt={resource.title}
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                />
                            )}

                            {isPdf && (
                                <iframe
                                    src={`${signedUrl}#view=FitH`}
                                    className="w-full h-full border-none"
                                    title="PDF Viewer"
                                />
                            )}

                            {isVideo && (
                                <video
                                    src={signedUrl}
                                    controls
                                    className="max-w-full max-h-full"
                                    autoPlay
                                />
                            )}

                            {isAudio && (
                                <div className="p-16 rounded-3xl bg-white/5 border border-white/10 text-center shadow-2xl backdrop-blur-sm">
                                    <div className="h-32 w-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-white/10">
                                        <Music className="h-16 w-16 text-pink-500 opacity-90" />
                                    </div>
                                    <h3 className="text-white text-lg font-medium mb-1">{resource.title}</h3>
                                    <p className="text-white/40 text-sm mb-8">Audio Preview</p>
                                    <audio src={signedUrl} controls className="w-full min-w-[300px]" />
                                </div>
                            )}

                            {isText && (
                                <div className="w-full h-full overflow-auto p-8 bg-[#0a0a0a]">
                                    <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-words leading-relaxed max-w-4xl mx-auto">
                                        {textContent || "Loading text content..."}
                                    </pre>
                                </div>
                            )}

                            {isOffice && (
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title="Office Document Viewer"
                                />
                            )}

                            {!isImage && !isPdf && !isVideo && !isAudio && !isText && !isOffice && (
                                <div className="text-center p-12 max-w-md">
                                    <div className="h-24 w-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <FileText className="h-10 w-10 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-2">Preview Unavailable</h3>
                                    <p className="text-white/50 mb-8 leading-relaxed">
                                        This file type cannot be previewed directly in the browser.
                                        Please download it to view correctly.
                                    </p>
                                    <Button asChild size="lg" className="rounded-full px-8">
                                        <a href={signedUrl} download target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download File
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-white/50">Failed to load resource URL</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
