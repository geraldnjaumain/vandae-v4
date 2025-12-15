"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    BookOpen,
    Globe,
    Search,
    ExternalLink,
    ChevronRight,
    Loader2,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    getCourseUnits,
    getResearchSources,
    extractCourseUnits,
    autoResearchAllUnits,
    type CourseUnit,
    type ResearchSource
} from "@/app/actions/research"
import { toast } from "sonner"

interface ResearchPanelProps {
    userId?: string
}

export function ResearchPanel({ userId }: ResearchPanelProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'units' | 'sources'>('units')
    const [isResearching, setIsResearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([])
    const [researchSources, setResearchSources] = useState<ResearchSource[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load initial data
    useEffect(() => {
        if (userId) {
            loadData()
        }
    }, [userId])

    const loadData = async () => {
        if (!userId) return

        setIsLoading(true)
        try {
            const [unitsResult, sourcesResult] = await Promise.all([
                getCourseUnits(userId),
                getResearchSources(userId)
            ])

            setCourseUnits(unitsResult.units || [])
            setResearchSources(sourcesResult.sources || [])

            // If no units, try to extract them
            if (unitsResult.units.length === 0) {
                const extractResult = await extractCourseUnits(userId)
                if (extractResult.units.length > 0) {
                    setCourseUnits(extractResult.units)
                    toast.success(extractResult.message)
                }
            }
        } catch (error) {
            console.error('Error loading research data:', error)
            toast.error('Failed to load research data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResearch = async () => {
        if (!userId) return

        setIsResearching(true)
        try {
            const result = await autoResearchAllUnits(userId)
            if (result.success) {
                toast.success(`Researched ${result.unitsResearched} units!`)
                await loadData() // Reload data
            } else {
                toast.error(result.error || 'Research failed')
            }
        } catch (error) {
            toast.error('Failed to update research')
        } finally {
            setIsResearching(false)
        }
    }

    const filteredUnits = courseUnits.filter(unit =>
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredSources = researchSources.filter(source =>
        source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="fixed top-20 right-4 h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white z-40"
            >
                <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
        )
    }

    return (
        <div className="w-96 border-l border-border bg-card flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-foreground">Research Hub</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('units')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === 'units'
                            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Units ({filteredUnits.length})</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('sources')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === 'sources'
                            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Sources ({filteredSources.length})</span>
                    </div>
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={activeTab === 'units' ? "Search units..." : "Search sources..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button
                    onClick={handleResearch}
                    disabled={isResearching || !userId}
                    className="w-full mt-2"
                    size="sm"
                >
                    {isResearching ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Researching...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Update Research
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {activeTab === 'units' ? (
                            filteredUnits.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No course units found.</p>
                                    <p className="text-xs mt-1">Upload syllabi or course materials to get started.</p>
                                </div>
                            ) : (
                                filteredUnits.map((unit) => (
                                    <Card key={unit.id} className="hover:shadow-md transition-all duration-200">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center justify-between">
                                                <span className="line-clamp-2">{unit.title}</span>
                                                {unit.completed && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 shrink-0 ml-2">
                                                        Done
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            {unit.course_name && (
                                                <p className="text-xs text-muted-foreground">{unit.course_name}</p>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1">
                                                {unit.topics.slice(0, 4).map((topic, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <div className="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                        <span className="line-clamp-1">{topic}</span>
                                                    </div>
                                                ))}
                                                {unit.topics.length > 4 && (
                                                    <div className="text-xs text-muted-foreground italic">
                                                        +{unit.topics.length - 4} more topics
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )
                        ) : (
                            filteredSources.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No research sources yet.</p>
                                    <p className="text-xs mt-1">Click "Update Research" to find relevant materials.</p>
                                </div>
                            ) : (
                                filteredSources.map((source) => (
                                    <Card
                                        key={source.id}
                                        className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                                        onClick={() => window.open(source.url, '_blank')}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                                    source.type === 'article' && "bg-blue-100 dark:bg-blue-950/30",
                                                    source.type === 'video' && "bg-red-100 dark:bg-red-950/30",
                                                    source.type === 'book' && "bg-green-100 dark:bg-green-950/30",
                                                    source.type === 'paper' && "bg-primary/10 dark:bg-purple-950/30"
                                                )}>
                                                    <Globe className={cn(
                                                        "h-5 w-5",
                                                        source.type === 'article' && "text-blue-600 dark:text-blue-400",
                                                        source.type === 'video' && "text-red-600 dark:text-red-400",
                                                        source.type === 'book' && "text-green-600 dark:text-green-400",
                                                        source.type === 'paper' && "text-purple-600 dark:text-purple-400"
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {source.title}
                                                        </h4>
                                                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    {source.snippet && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                            {source.snippet}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {source.type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {Math.round(source.relevance_score * 100)}% match
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* Stats Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
                <div className="text-xs text-muted-foreground text-center">
                    {activeTab === 'units' ? (
                        <span>{courseUnits.length} units tracked • Auto-updating</span>
                    ) : (
                        <span>{researchSources.length} sources found • {new Date().toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
