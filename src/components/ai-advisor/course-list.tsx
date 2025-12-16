"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Loader2, Trash2, Sparkles, CheckCircle } from 'lucide-react'
import { deleteCourse } from '@/app/actions/courses'
import { toast } from 'sonner'
import { useState } from 'react'

interface Course {
    id: string
    course_code: string
    course_name: string
    instructor?: string
    semester?: string
    description?: string
    is_analyzed: boolean
    units: any[]
    resources: any[]
}

interface CourseListProps {
    courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return

        setDeletingId(courseId)
        try {
            const result = await deleteCourse(courseId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Course deleted successfully')
            }
        } catch (error) {
            toast.error('Failed to delete course')
        } finally {
            setDeletingId(null)
        }
    }

    const handleAnalyze = async (courseId: string) => {
        toast.info('Analyzing course...')

        try {
            const res = await fetch('/api/ai-analyze-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            })

            const data = await res.json()

            if (data.success || data.message?.includes('already')) {
                toast.success('Course analyzed successfully!')
            } else {
                toast.error(data.error || 'Analysis failed')
            }
        } catch (error) {
            toast.error('Failed to analyze course')
        }
    }

    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">No courses added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add your courses to get personalized AI assistance
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <Card key={course.id} className="relative overflow-hidden">
                    {course.is_analyzed && (
                        <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Analyzed
                            </Badge>
                        </div>
                    )}

                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <Badge variant="outline" className="mb-2">
                                    {course.course_code}
                                </Badge>
                                <CardTitle className="text-base leading-tight">
                                    {course.course_name}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {course.instructor && (
                            <p className="text-sm text-muted-foreground">
                                👨‍🏫 {course.instructor}
                            </p>
                        )}

                        {course.semester && (
                            <p className="text-xs text-muted-foreground">
                                📅 {course.semester}
                            </p>
                        )}

                        {course.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {course.description}
                            </p>
                        )}

                        {course.is_analyzed && (
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>📚 {course.units.length} units</span>
                                <span>•</span>
                                <span>📖 {course.resources.length} resources</span>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            {!course.is_analyzed && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleAnalyze(course.id)}
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Analyze
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(course.id)}
                                disabled={deletingId === course.id}
                                className="text-destructive hover:text-destructive"
                            >
                                {deletingId === course.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
