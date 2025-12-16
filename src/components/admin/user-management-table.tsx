'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface User {
    id: string
    full_name: string
    email?: string
    university?: string
    created_at: string
    is_pro_member: boolean
    admin_users?: { role: string }[]
}

export function UserManagementTable({
    users,
    currentPage,
    totalPages,
    searchQuery,
}: {
    users: User[]
    currentPage: number
    totalPages: number
    searchQuery: string
}) {
    const [search, setSearch] = useState(searchQuery)

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    type="search"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Link href={`/admin/users?search=${search}&page=1`}>
                    <Button>Search</Button>
                </Link>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">University</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Joined</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium">{user.full_name}</p>
                                        {user.admin_users && user.admin_users.length > 0 && (
                                            <span className="text-xs text-primary">
                                                {user.admin_users[0].role}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{user.university || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    {user.is_pro_member && (
                                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                                            PRO
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Button variant="ghost" size="sm">
                                        View
                                    </Button>
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
                        <Link href={`/admin/users?search=${search}&page=${currentPage - 1}`}>
                            <Button variant="outline" size="sm">Previous</Button>
                        </Link>
                    )}
                    {currentPage < totalPages && (
                        <Link href={`/admin/users?search=${search}&page=${currentPage + 1}`}>
                            <Button variant="outline" size="sm">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
