"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Pencil } from "lucide-react"
import { addDays, format, getDay, setHours, setMinutes, parseISO } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createTimetableEvent, updateTimetableEvent, TimetableEvent } from "@/app/timetable/actions"

const daysOfWeek = [
    { label: "Monday", value: "1" },
    { label: "Tuesday", value: "2" },
    { label: "Wednesday", value: "3" },
    { label: "Thursday", value: "4" },
    { label: "Friday", value: "5" },
    { label: "Saturday", value: "6" },
    { label: "Sunday", value: "0" },
]

const formSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
    color: z.string(),
    isRecurring: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EventDialogProps {
    children?: React.ReactNode
    event?: TimetableEvent
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EventDialog({ children, event, open: controlledOpen, onOpenChange: controlledOnOpenChange }: EventDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            dayOfWeek: "1", // Monday
            startTime: "09:00",
            endTime: "10:00",
            location: "",
            isRecurring: true,
            color: "#3b82f6"
        },
    })


    // Reset/Populate form when dialog opens or event changes
    useEffect(() => {
        if (open) {
            if (event) {
                const startDate = parseISO(event.start_time)
                const endDate = parseISO(event.end_time)
                form.reset({
                    title: event.title,
                    dayOfWeek: getDay(startDate).toString(),
                    startTime: format(startDate, "HH:mm"),
                    endTime: format(endDate, "HH:mm"),
                    location: event.location || "",
                    isRecurring: event.is_recurring,
                    color: event.color || "#3b82f6"
                })
            } else {
                form.reset({
                    title: "",
                    dayOfWeek: "1",
                    startTime: "09:00",
                    endTime: "10:00",
                    location: "",
                    isRecurring: true,
                    color: "#3b82f6"
                })
            }
        }
    }, [open, event, form])

    async function onSubmit(values: FormValues) {
        try {
            // Calculate next instance date string
            const now = new Date()
            const currentDay = getDay(now)
            const targetDay = parseInt(values.dayOfWeek)

            let daysUntilTarget = targetDay - currentDay
            // If the target day is earlier in the week, or today but time passed, we might want next week.
            // For editing, we just want to preserve the day-of-week relative to... something.
            // Actually for MVP update, we are just calculating a valid date for that day of week.
            // If it's recurring, the exact date matters less than the recur pattern, but for sorting we need a date.

            if (daysUntilTarget < 0) daysUntilTarget += 7

            const targetDate = addDays(now, daysUntilTarget)

            // Set times
            const [startHour, startMinute] = values.startTime.split(':').map(Number)
            const [endHour, endMinute] = values.endTime.split(':').map(Number)

            const startDate = setMinutes(setHours(targetDate, startHour), startMinute)
            const endDate = setMinutes(setHours(targetDate, endHour), endMinute)

            const payload = {
                title: values.title,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                location: values.location,
                is_recurring: values.isRecurring,
                color: values.color
            }

            if (event) {
                await updateTimetableEvent(event.id, payload)
                toast.success("Class updated successfully")
            } else {
                await createTimetableEvent(payload)
                toast.success("Class added successfully")
            }

            setOpen(false)
            form.reset()
        } catch (error) {
            toast.error(event ? "Failed to update class" : "Failed to add class")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{event ? "Edit Class" : "Add Class to Timetable"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject / Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Calculus 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dayOfWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {daysOfWeek.map((day) => (
                                                    <SelectItem key={day.value} value={day.value}>
                                                        {day.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Room 304" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isRecurring"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Repeat Weekly
                                        </FormLabel>
                                        <p className="text-sm text-slate-500">
                                            Event will appear every week
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">{event ? "Save Changes" : "Save Class"}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
