"use client"

import { Task, updateTaskStatus, deleteTask } from "@/app/assignments/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Calendar, Trash, ArrowRight, CheckCircle, Circle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-muted text-muted-foreground', icon: Circle },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300', icon: ArrowRight },
    { id: 'completed', title: 'Completed', color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300', icon: CheckCircle },
]

export function TaskBoard({ tasks }: { tasks: Task[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
            {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id)
                return (
                    <div key={col.id} className="flex flex-col h-full bg-muted/30 rounded-xl border border-border">
                        {/* Column Header */}
                        <div className="p-3 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-sm rounded-t-xl">
                            <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                                <div className={cn("p-1 rounded bg-background border border-border shadow-sm", col.color)}>
                                    <col.icon className="h-3.5 w-3.5" />
                                </div>
                                {col.title}
                            </div>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] h-5 min-w-5 flex justify-center">
                                {colTasks.length}
                            </Badge>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                            {colTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            {colTasks.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/10">
                                    <col.icon className="h-6 w-6 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No tasks</span>
                                </div>
                            )}
                            <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 gap-2 hover:bg-background hover:shadow-sm transition-all border border-transparent hover:border-border">
                                <span className="text-lg leading-none">+</span> New
                            </Button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function TaskCard({ task }: { task: Task }) {
    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTaskStatus(task.id, newStatus)
            toast.success("Task updated")
        } catch (e) {
            toast.error("Failed to update task")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Delete task?")) return
        try {
            await deleteTask(task.id)
            toast.success("Task deleted")
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    const priorityColors = {
        low: "text-muted-foreground bg-muted",
        medium: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-300",
        high: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300"
    }

    return (
        <div className="p-4 bg-card border border-border shadow-sm rounded-lg hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className={cn("text-xs font-normal border-0", priorityColors[task.priority as keyof typeof priorityColors])}>
                    {task.priority}
                </Badge>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange('todo')}>Move to To Do</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>Move to In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('completed')}>Move to Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className="font-medium text-card-foreground mb-1">{task.title}</h4>

            {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                {task.category && (
                    <span className="bg-muted px-2 py-1 rounded">{task.category}</span>
                )}
                {task.due_date && (
                    <span className="flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), "MMM d")}
                    </span>
                )}
            </div>
        </div>
    )
}
