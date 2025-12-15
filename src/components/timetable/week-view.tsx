"use client"

import { useState } from "react"
import { TimetableEvent, deleteTimetableEvent } from "@/app/timetable/actions"
import { format, parseISO, getDay } from "date-fns"
import { MoreHorizontal, MapPin, Clock, Trash, Pencil } from "lucide-react"
import { toast } from "sonner"
import { EventDialog } from "@/components/timetable/add-event-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
// Map JS getDay() (0=Sun) to our array index
// getDay: 0=Sun, 1=Mon...
// We want Mon=0, Sun=6
const getDayIndex = (date: Date) => {
    const d = getDay(date)
    return d === 0 ? 6 : d - 1
}

export function WeekView({ events }: { events: TimetableEvent[] }) {
    // Group events by day index (0-6)
    const eventsByDay: TimetableEvent[][] = Array(7).fill([]).map(() => [])

    events.forEach(event => {
        const date = parseISO(event.start_time)
        const dayIndex = getDayIndex(date)

        // Logic: specific date for one-off, OR day-of-week match for recurring
        // For MVP we just put everything in its "Day of Week" bucket
        // Ideally we'd filter one-off events that are not "current week"
        // But let's assume all fetched events align or are recurring.

        if (dayIndex >= 0 && dayIndex <= 6) {
            eventsByDay[dayIndex] = [...eventsByDay[dayIndex], event]
        }
    })

    // Sort by time
    eventsByDay.forEach(dayEvents => {
        dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    })

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-h-[600px]">
            {days.map((dayName, index) => (
                <div key={dayName} className="flex flex-col gap-3 min-w-[200px] md:min-w-0">
                    <div className="p-3 bg-muted rounded-lg text-center font-medium text-foreground">
                        {dayName}
                        <span className="md:hidden ml-2 text-muted-foreground text-sm font-normal">
                            {/* Mobile only date hint could go here */}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 bg-muted/30 rounded-lg p-2">
                        {eventsByDay[index].map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                        {eventsByDay[index].length === 0 && (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic py-8">
                                Free
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function EventCard({ event }: { event: TimetableEvent }) {
    const [editOpen, setEditOpen] = useState(false)
    const handleDelete = async () => {
        if (!confirm("Delete this class?")) return
        try {
            await deleteTimetableEvent(event.id)
            toast.success("Class removed")
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    const startTime = format(parseISO(event.start_time), "h:mm a")
    const endTime = format(parseISO(event.end_time), "h:mm a")

    return (
        <div
            className="p-3 bg-card rounded-md border shadow-sm hover:shadow-md transition-shadow relative group"
            style={{ borderLeftColor: event.color || '#3b82f6', borderLeftWidth: '4px' }}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm line-clamp-2 text-card-foreground">{event.title}</h4>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <EventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />

            <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {startTime} - {endTime}
                </div>
                {event.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                    </div>
                )}
            </div>
        </div>
    )
}
