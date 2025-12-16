"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { addCourse } from '@/app/actions/courses'
import { toast } from 'sonner'

export function AddCourseDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = await addCourse(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Course added successfully! AI analysis starting...')
                setOpen(false)
                    ; (e.target as HTMLFormElement).reset()

                // Trigger AI analysis
                if (result.courseId) {
                    fetch('/api/ai-analyze-course', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ courseId: result.courseId })
                    }).then(res => res.json()).then(data => {
                        if (data.success) {
                            toast.success('Course analyzed successfully!')
                        } else {
                            toast.error('AI analysis failed: ' + (data.error || 'Unknown error'))
                        }
                    }).catch(() => {
                        toast.error('Failed to analyze course')
                    })
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add course')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="course_code">Course Code *</Label>
                        <Input
                            id="course_code"
                            name="course_code"
                            placeholder="e.g., CS101"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course_name">Course Name *</Label>
                        <Input
                            id="course_name"
                            name="course_name"
                            placeholder="e.g., Introduction to Programming"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Input
                            id="instructor"
                            name="instructor"
                            placeholder="e.g., Dr. Smith"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                            id="semester"
                            name="semester"
                            placeholder="e.g., Fall 2024"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Brief course description..."
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
