"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Download, Users, Calendar, FileText, X } from "lucide-react"

interface Paper {
    title: string
    authors: string[]
    year: string
    abstract: string
    citations: number
    url: string
    pdfUrl?: string
    source?: string
    venue?: string
}

interface PaperViewerProps {
    paper: Paper | null
    isOpen: boolean
    onClose: () => void
}

export function PaperViewer({ paper, isOpen, onClose }: PaperViewerProps) {
    if (!paper) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-card">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-xl leading-tight pr-8">
                                {paper.title}
                            </DialogTitle>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                                {paper.authors && paper.authors.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {paper.authors.slice(0, 5).join(', ')}
                                        {paper.authors.length > 5 && ' et al.'}
                                    </span>
                                )}
                                {paper.year && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {paper.year}
                                    </span>
                                )}
                                {paper.citations > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {paper.citations} citations
                                    </Badge>
                                )}
                            </div>
                            {paper.venue && (
                                <p className="text-sm text-muted-foreground mt-1">📚 {paper.venue}</p>
                            )}
                        </div>
                        {paper.source && <Badge variant="outline">{paper.source}</Badge>}
                    </div>
                </DialogHeader>

                {/* Content */}
                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-6">
                        {/* Abstract */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Abstract
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {paper.abstract || 'No abstract available.'}
                            </p>
                        </div>

                        {/* PDF Viewer */}
                        {paper.pdfUrl && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Full Paper (PDF)</h3>
                                <div className="w-full h-[500px] border-2 border-border rounded-lg overflow-hidden bg-muted">
                                    <iframe
                                        src={paper.pdfUrl}
                                        className="w-full h-full"
                                        title="Paper PDF"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Paper Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Authors</p>
                                    <p className="font-medium mt-1">
                                        {paper.authors.length > 0 ? paper.authors.join(', ') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Year</p>
                                    <p className="font-medium mt-1">{paper.year}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Source</p>
                                    <p className="font-medium mt-1">{paper.source || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Citations</p>
                                    <p className="font-medium mt-1">{paper.citations}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {paper.pdfUrl && (
                            <Button variant="default" size="sm" asChild>
                                <a href={paper.pdfUrl} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3 w-3 mr-1" />
                                    Download PDF
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {paper.source ? `View on ${paper.source}` : 'View Source'}
                            </a>
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4 mr-1" />
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
