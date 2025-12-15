"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { FileText, Upload } from "lucide-react"
import { Database } from "@/types/database.types"
import { formatDistance } from "date-fns"

type Resource = Database['public']['Tables']['resources']['Row']

interface ResourcesCardProps {
    resources: Resource[]
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
}

function getFileIcon(fileType: string) {
    return <FileText className="h-5 w-5 text-muted-foreground" />
}

export function ResourcesCard({ resources }: ResourcesCardProps) {
    if (resources.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Recent Resources
                    </CardTitle>
                    <CardDescription>Your study materials</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Typography variant="small" className="font-medium">
                            No resources yet
                        </Typography>
                        <Typography variant="muted" className="text-xs">
                            Upload your notes, PDFs, and study materials
                        </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Resources
                </CardTitle>
                <CardDescription>{resources.length} recent uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
                {resources.map((resource) => {
                    const uploadedAgo = formatDistance(new Date(resource.created_at), new Date(), { addSuffix: true })

                    return (
                        <div
                            key={resource.id}
                            className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {getFileIcon(resource.file_type)}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <Typography variant="small" className="font-medium truncate">
                                        {resource.title}
                                    </Typography>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="uppercase">{resource.file_type}</span>
                                        <span>•</span>
                                        <span>{formatFileSize(resource.file_size)}</span>
                                        <span>•</span>
                                        <span>{uploadedAgo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
