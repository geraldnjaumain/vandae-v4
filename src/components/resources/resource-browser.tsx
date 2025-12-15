"use client"

import * as React from "react"
import { Resource } from "@/app/resources/actions"
import { FileGrid } from "@/components/resources/file-grid"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Typography } from "@/components/ui/typography"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function ResourceBrowser({ resources }: { resources: Resource[] }) {
    const [query, setQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState<string>("all")

    const filteredResources = React.useMemo(() => {
        return resources.filter(file => {
            const matchesQuery = file.title.toLowerCase().includes(query.toLowerCase())
            const matchesType = typeFilter === "all" ||
                (typeFilter === "pdf" && file.file_type === "pdf") ||
                (typeFilter === "image" && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.file_type)) ||
                (typeFilter === "document" && ['doc', 'docx', 'txt', 'md'].includes(file.file_type))

            return matchesQuery && matchesType
        })
    }, [resources, query, typeFilter])

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search files..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <Filter className="mr-2 h-4 w-4 text-slate-500" />
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Files</SelectItem>
                            <SelectItem value="pdf">PDFs</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="document">Documents</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="text-sm text-slate-500 whitespace-nowrap ml-2">
                        {filteredResources.length} files
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredResources.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                        <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="font-medium">No files found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <FileGrid resources={filteredResources} />
            )}
        </div>
    )
}
