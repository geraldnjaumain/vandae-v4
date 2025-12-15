"use client"

import { useState } from "react"
import { Upload, FileText, Check, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { parseSyllabusPDF, saveImportedEvents, ExtractedEvent } from "@/app/timetable/syllabus-actions"

export function SyllabusImportDialog() {
    const [open, setOpen] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([])
    const [step, setStep] = useState<'upload' | 'review'>('upload')

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsAnalyzing(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const events = await parseSyllabusPDF(formData)
            setExtractedEvents(events)
            setStep('review')
            toast.success(`Found ${events.length} events`)
        } catch (error: any) {
            toast.error(error.message || "Failed to analyze syllabus")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveImportedEvents(extractedEvents)
            toast.success("Schedule successfully imported!")
            setOpen(false)
            setStep('upload')
            setExtractedEvents([])
        } catch (error) {
            toast.error("Failed to save events")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4 text-purple-600" />
                    AI Import
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import Syllabus with AI</DialogTitle>
                    <DialogDescription>
                        Upload your course syllabus (PDF) and we'll extract the schedule for you.
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' ? (
                    <div className="py-8">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                            {isAnalyzing ? (
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mx-auto" />
                                    <p className="font-medium text-slate-900">Analyzing Syllabus...</p>
                                    <p className="text-sm text-slate-500">Extracting dates, exams, and assignments</p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                                        <Upload className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 mb-1">Upload Syllabus PDF</h3>
                                    <p className="text-sm text-slate-500 mb-4">Drag & drop or click to browse</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                    />
                                    <Button variant="secondary" size="sm">Select File</Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Found {extractedEvents.length} Events</h4>
                            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>Back</Button>
                        </div>

                        <ScrollArea className="h-[300px] border rounded-lg p-4 bg-slate-50">
                            <div className="space-y-3">
                                {extractedEvents.map((evt, i) => (
                                    <div key={i} className="flex gap-3 bg-white p-3 rounded border shadow-sm">
                                        <div className="h-10 w-10 shrink-0 rounded bg-slate-100 flex items-center justify-center flex-col text-xs font-bold text-slate-600">
                                            <span>{new Date(evt.start_time).getDate()}</span>
                                            <span className="uppercase text-[10px] font-normal">{format(new Date(evt.start_time), 'MMM')}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-sm truncate pr-2">{evt.title}</p>
                                                <Badge variant="secondary" className="text-[10px] h-5">{evt.type}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(evt.start_time), 'h:mm a')} - {format(new Date(evt.end_time), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <DialogFooter>
                            <Button onClick={handleSave} disabled={isSaving} className="w-full">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Confirm Import
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}


