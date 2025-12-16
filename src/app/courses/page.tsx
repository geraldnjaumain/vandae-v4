import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { AddCourseDialog } from "@/components/ai-advisor/add-course-dialog"
import { CourseList } from "@/components/ai-advisor/course-list"

async function getUserCourses(userId: string) {
    const supabase = await createClient()

    const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return courses || []
}

export default async function CoursesPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const courses = await getUserCourses(user.id)

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <Typography variant="h1" className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary" />
                            My Courses
                        </Typography>
                        <Typography variant="muted">
                            Manage your courses and get AI-powered study assistance
                        </Typography>
                    </div>
                    <AddCourseDialog />
                </div>

                {/* Info Card */}
                {courses.length === 0 && (
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Get Started with AI-Powered Course Analysis</CardTitle>
                            <CardDescription>
                                Add your courses to unlock personalized study plans, unit breakdowns, and resource recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    AI analyzes each course and generates unit breakdowns
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    Get recommended resources and study materials
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    Receive personalized study suggestions and exam tips
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    Chat with AI advisor about course-specific topics
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Course List */}
                <CourseList courses={courses} />
            </div>
        </AppLayout>
    )
}
