"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { parseSyllabus } from "@/app/actions/syllabus"
import { toast } from "sonner"

interface UploadSyllabusModalProps {
    trigger?: React.ReactNode
}

export function UploadSyllabusModal({ trigger }: UploadSyllabusModalProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [dragActive, setDragActive] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type === "application/pdf") {
                setSelectedFile(file)
            } else {
                toast.error("Please upload a PDF file")
            }
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "application/pdf") {
                setSelectedFile(file)
            } else {
                toast.error("Please upload a PDF file")
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first")
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const result = await parseSyllabus(formData)

            if (result.error) {
                toast.error(result.error)
            } else if (result.success) {
                toast.success(`Syllabus imported! ${result.count} events added to your calendar.`, {
                    description: "Check your timetable to see the new events",
                    duration: 5000,
                })
                setIsOpen(false)
                setSelectedFile(null)
                // Refresh the page to show new events
                window.location.reload()
            }
        } catch (error) {
            toast.error("Failed to parse syllabus. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    const resetAndClose = () => {
        setSelectedFile(null)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Syllabus
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-yellow-500" />
                        Upload Syllabus (Pro Feature)
                    </DialogTitle>
                    <DialogDescription>
                        Upload your course syllabus PDF and we'll automatically extract all assignment deadlines and exam dates
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? "border-slate-400 bg-slate-50"
                            : "border-notion-border hover:border-slate-300"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {!selectedFile ? (
                            <div className="space-y-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                                    <Upload className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <Typography variant="small" className="font-medium">
                                        Drop your syllabus PDF here
                                    </Typography>
                                    <Typography variant="muted" className="text-xs">
                                        or click to browse files
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                    <FileText className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="small" className="font-medium">
                                        {selectedFile.name}
                                    </Typography>
                                    <Typography variant="muted" className="text-xs">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </Typography>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedFile(null)
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="space-y-1">
                                <Typography variant="small" className="font-medium text-blue-900">
                                    AI-Powered Extraction
                                </Typography>
                                <Typography variant="muted" className="text-xs text-blue-700">
                                    Our AI will automatically identify assignment deadlines, exam dates, and important class events from your syllabus.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={resetAndClose}
                            disabled={isUploading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="flex-1"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Import Events
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
