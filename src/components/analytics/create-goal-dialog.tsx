"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createGoal } from "@/app/actions/analytics"
import { toast } from "sonner"

interface CreateGoalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const result = await createGoal({
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            goalType: formData.get("goalType") as any,
            targetValue: Number(formData.get("targetValue")),
            unit: formData.get("unit") as string,
            targetDate: formData.get("targetDate") as string,
        })

        setLoading(false)

        if (result.error) {
            toast.error("Failed to create goal")
        } else {
            toast.success("Goal created successfully!")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Goal Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Study 10 hours per week" required />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Why is this goal important to you?"
                            rows={3}
                        />
                    </div>

                    {/* Goal Type */}
                    <div className="space-y-2">
                        <Label htmlFor="goalType">Goal Type</Label>
                        <Select name="goalType" required defaultValue="study_time">
                            <SelectTrigger>
                                <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="study_time">Study Time</SelectItem>
                                <SelectItem value="grade_average">Grade Average</SelectItem>
                                <SelectItem value="flashcard_retention">Flashcard Retention</SelectItem>
                                <SelectItem value="assignment_completion">Assignment Completion</SelectItem>
                                <SelectItem value="streak">Study Streak</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetValue">Target Value</Label>
                            <Input
                                id="targetValue"
                                name="targetValue"
                                type="number"
                                step="any"
                                placeholder="10"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input id="unit" name="unit" placeholder="hours" />
                        </div>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-2">
                        <Label htmlFor="targetDate">Target Date (Optional)</Label>
                        <Input id="targetDate" name="targetDate" type="date" />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Goal"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
