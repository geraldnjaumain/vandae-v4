'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Community {
    id: string
    name: string
    description?: string
    member_count: number
    created_at: string
    is_private: boolean
    profiles?: { full_name: string }
}

export function CommunityManagementTable({
    communities,
    currentPage,
    totalPages,
}: {
    communities: Community[]
    currentPage: number
    totalPages: number
}) {
    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Creator</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Members</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Created</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Visibility</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {communities.map((community) => (
                            <tr key={community.id} className="border-t">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{community.name}</p>
                                    {community.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {community.description}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {(community.profiles as any)?.full_name || 'Unknown'}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                    {community.member_count}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(community.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded ${community.is_private ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {community.is_private ? 'Private' : 'Public'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/community/${community.id}`}>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Link href={`/admin/communities?page=${currentPage - 1}`}>
                            <Button variant="outline" size="sm">Previous</Button>
                        </Link>
                    )}
                    {currentPage < totalPages && (
                        <Link href={`/admin/communities?page=${currentPage + 1}`}>
                            <Button variant="outline" size="sm">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
