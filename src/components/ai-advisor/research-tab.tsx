"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BookOpen, ExternalLink, Download, FileText, Users, Calendar } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PaperViewer } from "./paper-viewer"

interface ResearchResult {
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

export function ResearchTab() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ResearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
   const [selectedPaper, setSelectedPaper] = useState<ResearchResult | null>(null)
    const [isViewerOpen, setIsViewerOpen] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        
        try {
            // Call our custom academic search API
            const response = await fetch(`/api/research-search?q=${encodeURIComponent(query)}`)
            const data = await response.json()

            if (data.success && data.results && data.results.length > 0) {
                setResults(data.results)
            } else {
                setResults([])
            }
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="p-6">
                    <div className="flex items-center gap- mb-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Academic Research</h2>
                            <p className="text-xs text-muted-foreground">Semantic Scholar • arXiv • No Redirects</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search for research papers..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
                            {isLoading ? (
                                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                {!results.length ? (
                    <div className="max-w-3xl mx-auto p-8">
                        <h3 className="text-2xl font-bold mb-2 text-center">
                            Search Academic Papers
                        </h3>
                        <p className="text-muted-foreground mb-8 text-center max-w-md mx-auto">
                            Search millions of academic papers directly in Vadea. Results appear instantly with no redirects.
                        </p>

                        {/* Quick Searches */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Popular Searches:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Quantum Computing', 'CRISPR', 'Climate Change', 'Neural Networks'].map((term) => (
                                    <Button
                                        key={term}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setQuery(term)
                                            setTimeout(handleSearch, 100)
                                        }}
                                    >
                                        {term}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <FileText className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle className="text-sm">Research Papers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        Access millions of academic papers from top databases
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <Users className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle className="text-sm">Citation Data</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        See citation counts and find related papers
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <Download className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle className="text-sm">PDF Access</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        Direct links to full papers when available
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 p-6 max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Search Results</h3>
                                <p className="text-sm text-muted-foreground">{results.length} papers found</p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setResults([])}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                New Search
                            </Button>
                        </div>

                        {/* Paper Results */}
                        <div className="space-y-3">
                            {results.map((paper, idx) => (
                                <Card key={idx} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <CardTitle className="text-base leading-tight mb-2">
                                                    <a 
                                                        href={paper.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-start gap-2"
                                                    >
                                                        <span>{paper.title}</span>
                                                        <ExternalLink className="h-3 w-3 mt-1 shrink-0" />
                                                    </a>
                                                </CardTitle>
                                                <CardDescription className="text-xs space-y-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {paper.authors && paper.authors.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {paper.authors.slice(0, 3).join(', ')}
                                                                {paper.authors.length > 3 && ' et al.'}
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
                                                        <div className="text-xs text-muted-foreground">
                                                            📚 {paper.venue}
                                                        </div>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            {paper.source && (
                                                <Badge variant="outline" className="shrink-0">
                                                    {paper.source}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                            {paper.abstract}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="default" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPaper(paper)
                                                    setIsViewerOpen(true)
                                                }}
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                View Paper
                                            </Button>
                                            {paper.pdfUrl && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPaper(paper)
                                                        setIsViewerOpen(true)
                                                    }}
                                                >
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Read PDF
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {results.length === 0 && (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No results found. Try a different search term.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* Paper Viewer Modal */}
            <PaperViewer 
                paper={selectedPaper}
                isOpen={isViewerOpen}
                onClose={() => {
                    setIsViewerOpen(false)
                    setSelectedPaper(null)
                }}
            />
        </div>
    )
}
