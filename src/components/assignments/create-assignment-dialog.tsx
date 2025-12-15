"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Save, FileText } from "lucide-react"
import { toast } from "sonner"
import { AssignmentEditor } from "@/components/assignments/assignment-editor"

interface CreateAssignmentDialogProps {
    onAssignmentCreated?: () => void
}

export function CreateAssignmentDialog({ onAssignmentCreated }: CreateAssignmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [showEditor, setShowEditor] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

    const handleCreateQuick = async () => {
        if (!title.trim()) {
            toast.error("Please enter a title")
            return
        }

        toast.success("Assignment created!")
        setOpen(false)
        resetForm()
        onAssignmentCreated?.()
    }

    const handleOpenEditor = () => {
        if (!title.trim()) {
            toast.error("Please enter a title first")
            return
        }
        setShowEditor(true)
        setOpen(false)
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setDueDate("")
        setPriority("medium")
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Assignment
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>
                            Add a new assignment to your task board
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Research Paper on Machine Learning"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Add details about your assignment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="due-date">Due Date</Label>
                                <Input
                                    id="due-date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCreateQuick} variant="outline" className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Quick Add
                        </Button>
                        <Button onClick={handleOpenEditor} className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            Open Editor
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Assignment Editor */}
            {showEditor && (
                <AssignmentEditor
                    open={showEditor}
                    onOpenChange={setShowEditor}
                    initialData={{
                        title,
                        description,
                        dueDate,
                        priority
                    }}
                    onSave={() => {
                        toast.success("Assignment saved!")
                        setShowEditor(false)
                        resetForm()
                        onAssignmentCreated?.()
                    }}
                />
            )}
        </>
    )
}
