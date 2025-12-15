"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Typography } from "@/components/ui/typography"
import {
    Heart,
    MessageCircle,
    MoreHorizontal,
    Pin,
    Trash,
    AlertCircle,
    FileIcon,
    ImageIcon,
    Video,
    FileText
} from "lucide-react"
import { useMediaViewer } from "@/lib/stores/media-viewer-store"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleLike, togglePin, deletePost, createComment, getComments, deleteComment } from "@/app/actions/community"
import { formatDistance } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { EditPostDialog } from "@/components/community/edit-post-dialog"
import { Pencil } from "lucide-react"

interface PostCardProps {
    post: {
        id: string
        content: string
        likes_count: number
        comments_count: number
        created_at: string
        is_pinned: boolean
        author_id: string
        profiles: {
            id: string
            full_name: string
            avatar_url: string | null
        } | null
        communities: {
            id: string
            name: string
        } | null
        community_id?: string
        attachments?: string[]
    }
    currentUserId: string
    currentCommunityId?: string
    isCommunityAdmin?: boolean
    initialIsLiked?: boolean
}

export function PostCard({ post, currentUserId, currentCommunityId, isCommunityAdmin = false, initialIsLiked = false }: PostCardProps) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [isLiked, setIsLiked] = React.useState(initialIsLiked)
    const [likesCount, setLikesCount] = React.useState(post.likes_count)
    const [isLiking, setIsLiking] = React.useState(false)
    const [showComments, setShowComments] = React.useState(false)
    const [comments, setComments] = React.useState<any[]>([])
    const [isLoadingComments, setIsLoadingComments] = React.useState(false)
    const [commentText, setCommentText] = React.useState("")
    const [isPostingComment, setIsPostingComment] = React.useState(false)
    const router = useRouter()

    const timeAgo = formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })
    const isAuthor = currentUserId === post.author_id
    const communityId = currentCommunityId || post.communities?.id || post.community_id

    const handleLike = async () => {
        // Optimistic UI update
        const previousLiked = isLiked
        const previousCount = likesCount

        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
        setIsLiking(true)

        try {
            const result = await toggleLike(post.id)

            if (result.error) {
                // Revert on error
                setIsLiked(previousLiked)
                setLikesCount(previousCount)
                toast.error(result.error)
            } else {
                // Update with server response
                // Optimistic update holds true if no error
            }
        } catch (error) {
            // Revert on error
            setIsLiked(previousLiked)
            setLikesCount(previousCount)
            toast.error("Failed to update like")
        } finally {
            setIsLiking(false)
        }
    }

    const handlePin = async () => {
        if (!communityId) return
        try {
            const result = await togglePin(post.id, communityId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(post.is_pinned ? "Post unpinned" : "Post pinned")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to update pin status")
        }
    }

    const handleDelete = async () => {
        if (!communityId) return
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            const result = await deletePost(post.id, communityId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Post deleted")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to delete post")
        }
    }

    const handleToggleComments = async () => {
        const newShowComments = !showComments
        setShowComments(newShowComments)

        if (newShowComments && comments.length === 0) {
            setIsLoadingComments(true)
            const res = await getComments(post.id)
            if (res.comments) {
                setComments(res.comments)
            }
            setIsLoadingComments(false)
        }
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return

        setIsPostingComment(true)
        const res = await createComment(post.id, commentText)
        setIsPostingComment(false)

        if (res.error) {
            toast.error(res.error)
        } else if (res.comment) {
            setComments(prev => [...prev, res.comment])
            setCommentText("")
            toast.success("Comment posted")
            router.refresh() // Update count in list
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return
        const res = await deleteComment(commentId, post.id)
        if (res.error) {
            toast.error(res.error)
        } else {
            setComments(prev => prev.filter(c => c.id !== commentId))
            toast.success("Comment deleted")
            router.refresh()
        }
    }

    return (
        <Card className={`hover:shadow-md transition-shadow relative ${post.is_pinned ? 'border-amber-200 bg-amber-50/30' : ''}`}>
            {post.is_pinned && (
                <div className="absolute top-0 right-0 p-2">
                    <Pin className="h-4 w-4 text-amber-500 rotate-45" />
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold overflow-hidden">
                            {post.profiles?.avatar_url ? (
                                <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="h-full w-full object-cover" />
                            ) : (
                                post.profiles?.full_name?.[0] || '?'
                            )}
                        </div>

                        {/* Author & Community */}
                        <div>
                            <div className="flex items-center gap-2">
                                <Typography variant="small" className="font-semibold">
                                    {post.profiles?.full_name || 'Anonymous'}
                                </Typography>
                                {post.communities && !currentCommunityId && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <Badge variant="outline" className="text-xs">
                                            {post.communities.name}
                                        </Badge>
                                    </>
                                )}
                                {post.is_pinned && (
                                    <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 ml-2">
                                        Pinned
                                    </Badge>
                                )}
                            </div>
                            <Typography variant="muted" className="text-xs">
                                {timeAgo}
                            </Typography>
                        </div>
                    </div>

                    {/* More Options Button */}
                    {(isAuthor || isCommunityAdmin) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isCommunityAdmin && (
                                    <DropdownMenuItem onClick={handlePin}>
                                        <Pin className="mr-2 h-4 w-4" />
                                        {post.is_pinned ? "Unpin Post" : "Pin Post"}
                                    </DropdownMenuItem>
                                )}
                                {(isAuthor || isCommunityAdmin) && (
                                    <>
                                        {isCommunityAdmin && <DropdownMenuSeparator />}
                                        {isAuthor && (
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit Post
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete Post
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {post.community_id && (
                <EditPostDialog
                    open={isEditing}
                    onOpenChange={setIsEditing}
                    post={{
                        id: post.id,
                        content: post.content,
                        community_id: post.community_id
                    }}
                />
            )}

            <CardContent className="pb-3 space-y-3">
                <Typography variant="p" className="whitespace-pre-wrap">
                    {post.content}
                </Typography>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {post.attachments.map((url, i) => {
                            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                            const isVideo = url.match(/\.(mp4|webm|ogg)$/i)
                            const isPDF = url.match(/\.pdf$/i)
                            const fileName = url.split('/').pop()?.split('-').slice(1).join('-') || 'File'

                            const handleOpen = (e: React.MouseEvent) => {
                                e.preventDefault()
                                useMediaViewer.getState().open(url, fileName)
                            }

                            if (isImage) {
                                return (
                                    <div key={i} className="col-span-2 sm:col-span-1 rounded-lg overflow-hidden border border-slate-200 relative aspect-video group cursor-pointer" onClick={handleOpen}>
                                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                )
                            }

                            if (isVideo || isPDF) {
                                return (
                                    <div key={i} onClick={handleOpen} className="col-span-2 flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            {isVideo ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                                            <p className="text-xs text-slate-500">{isVideo ? 'Video' : 'PDF Document'}</p>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <FileIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                                        <p className="text-xs text-slate-500">Attachment</p>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-notion-border">
                <div className="flex items-center gap-4 w-full">
                    {/* Like Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`gap-2 ${isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-600'}`}
                    >
                        <Heart
                            className={`h-4 w-4 ${isLiked ? 'fill-red-600' : ''}`}
                        />
                        <span className="text-sm">{likesCount}</span>
                    </Button>

                    {/* Comment Button */}
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600" onClick={handleToggleComments}>
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{post.comments_count}</span>
                    </Button>
                </div>
            </CardFooter>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-4">
                    {/* Comment List */}
                    <div className="space-y-4">
                        {isLoadingComments ? (
                            <p className="text-center text-sm text-slate-500 py-2">Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 py-2">No comments yet. Be the first!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-600">{comment.profiles?.full_name?.[0] || '?'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-900">{comment.profiles?.full_name}</span>
                                                <span className="text-xs text-slate-400">{formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                        {comment.user_id === currentUserId && (
                                            <div className="flex justify-end px-2">
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handlePostComment} className="flex gap-2 items-start mt-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-700">Me</span>
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={isPostingComment}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!commentText.trim() || isPostingComment}
                                className="rounded-full px-4"
                            >
                                {isPostingComment ? '...' : 'Post'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </Card>
    )
}
