import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { CheckSquare } from "lucide-react"
import { TaskBoard } from "@/components/assignments/task-board"
import { CreateAssignmentDialog } from "@/components/assignments/create-assignment-dialog"
import { getTasks } from "@/app/assignments/actions"

export default async function AssignmentsPage() {
    const tasks = await getTasks()

    return (
        <AppLayout>
            <div className="container mx-auto p-6 max-w-[1600px] h-[calc(100vh-4rem)] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                    <div>
                        <Typography variant="h1" className="flex items-center gap-2">
                            <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                            Assignments
                        </Typography>
                        <Typography variant="muted">
                            Track your tasks and deadlines with AI-powered writing assistance
                        </Typography>
                    </div>
                    <CreateAssignmentDialog />
                </div>

                <div className="flex-1 min-h-0">
                    <TaskBoard tasks={tasks} />
                </div>
            </div>
        </AppLayout>
    )
}
