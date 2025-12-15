import { AppLayout } from "@/components/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <AppLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Bento Grid Skeleton */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(300px,auto)]">
                    {/* Schedule Card Skeleton - Spans 2 columns */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-4 rounded-lg bg-gray-100 space-y-2 animate-pulse">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                </div>
                                <div className="p-4 rounded-lg bg-gray-100 space-y-2 animate-pulse">
                                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes Card Skeleton - Spans 2 rows */}
                    <div className="lg:row-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-3/6 bg-gray-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resources Card Skeleton */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="p-3 rounded-lg bg-gray-100 space-y-2 animate-pulse">
                                    <div className="h-4 w-4/5 bg-gray-200 rounded" />
                                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                                </div>
                                <div className="p-3 rounded-lg bg-gray-100 space-y-2 animate-pulse">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                </div>
                                <div className="p-3 rounded-lg bg-gray-100 space-y-2 animate-pulse">
                                    <div className="h-4 w-4/5 bg-gray-200 rounded" />
                                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Community Card Skeleton */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="h-6 w-44 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-4/6 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
