"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Users, Calendar, Hash, ArrowRight, Command, LayoutGrid, FolderOpen, BookOpen, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
// import { searchResources } from "@/app/resources/actions" // TODO: Implement if needed
import { createClient } from "@/lib/supabase-browser"

interface SearchResult {
    id: string
    type: 'nav' | 'file' | 'community' | 'channel'
    title: string
    subtitle?: string
    icon: React.ElementType
    href: string
}

const STATIC_NAV: SearchResult[] = [
    { id: 'nav-dashboard', type: 'nav', title: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { id: 'nav-community', type: 'nav', title: 'Communities', icon: Users, href: '/community' },
    { id: 'nav-resources', type: 'nav', title: 'Resources', icon: FolderOpen, href: '/resources' },
    { id: 'nav-assignments', type: 'nav', title: 'Assignments', icon: FileText, href: '/assignments' },
    { id: 'nav-timetable', type: 'nav', title: 'Timetable', icon: Calendar, href: '/timetable' },
    { id: 'nav-notifications', type: 'nav', title: 'Notifications', icon: Bell, href: '/notifications' },
    { id: 'nav-ai', type: 'nav', title: 'AI Advisor', icon: BookOpen, href: '/ai-advisor' },
]

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<SearchResult[]>(STATIC_NAV)
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const supabase = createClient()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        const openMenu = () => setOpen(true)

        document.addEventListener("keydown", down)
        document.addEventListener("vadea:open-command-menu", openMenu)
        return () => {
            document.removeEventListener("keydown", down)
            document.removeEventListener("vadea:open-command-menu", openMenu)
        }
    }, [])

    React.useEffect(() => {
        if (!open) {
            setQuery("")
            setResults(STATIC_NAV)
            return
        }

        if (!query) {
            setResults(STATIC_NAV)
            return
        }

        const search = async () => {
            setIsLoading(true)
            const searchResults: SearchResult[] = []

            // 1. Filter Nav
            const navMatches = STATIC_NAV.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            )
            searchResults.push(...navMatches)

            // 2. Search Communities/Channels (Simple mock or real DB call if feasible locally)
            // Ideally we call a server action, but let's do a quick client-side fetch if simple
            // For now, let's implement a quick DB text search via Supabase client directly

            try {
                // Search Communities
                const { data: communities } = await supabase
                    .from('communities')
                    .select('id, name')
                    .ilike('name', `%${query}%`)
                    .limit(3)

                if (communities) {
                    communities.forEach(c => {
                        searchResults.push({
                            id: `comm-${c.id}`,
                            type: 'community',
                            title: c.name,
                            subtitle: 'Community',
                            icon: Users,
                            href: `/community/${c.id}`
                        })
                    })
                }

                // Search Files (Resources)
                const { data: files } = await supabase
                    .from('resources')
                    .select('id, title, file_type')
                    .ilike('title', `%${query}%`)
                    .limit(5)

                if (files) {
                    files.forEach(f => {
                        searchResults.push({
                            id: `file-${f.id}`,
                            type: 'file',
                            title: f.title,
                            subtitle: f.file_type.toUpperCase(),
                            icon: FileText,
                            href: '/resources' // Unfortunately we can't deep direct link easily without a viewer, but resources page is fine
                        })
                    })
                }

            } catch (err) {
                console.error("Search failed", err)
            }

            setResults(searchResults)
            setIsLoading(false)
        }

        const timer = setTimeout(search, 300)
        return () => clearTimeout(timer)
    }, [query, open])

    const handleSelect = (href: string) => {
        router.push(href)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden shadow-2xl sm:max-w-xl gap-0 [&_[data-close-icon]]:hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Command Menu</DialogTitle>
                </DialogHeader>
                <div className="flex items-center border-b px-3 h-14">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5">
                        ESC
                    </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result.href)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-white group-hover:border-slate-300 transition-colors">
                                        <result.icon className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">{result.title}</div>
                                        <div className="text-xs text-slate-500">
                                            {result.subtitle || result.type}
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-slate-50 px-3 py-2 border-t flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex gap-2">
                        <span>Search for communities, files, and more</span>
                    </div>
                    <div className="flex gap-2">
                        <span>Vadea OS v4.0</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
