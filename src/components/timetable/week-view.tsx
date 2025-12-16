"use client"

import { useState, useEffect } from "react"
import { TimetableEvent, deleteTimetableEvent } from "@/app/timetable/actions"
import { format, parseISO, getDay, isToday } from "date-fns"
import { MoreHorizontal, MapPin, Clock, Trash, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { EventDialog } from "@/components/timetable/add-event-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Helper to map JS getDay() (0=Sun) to our array index (0=Mon...6=Sun)
const getDayIndex = (date: Date) => {
    const d = getDay(date)
    return d === 0 ? 6 : d - 1
}

export function WeekView({ events }: { events: TimetableEvent[] }) {
    // Current day logic for initial tab
    const [currentDayIndex, setCurrentDayIndex] = useState(0)

    useEffect(() => {
        // Set initial tab to today
        setCurrentDayIndex(getDayIndex(new Date()))
    }, [])

    // Group events by day index (0-6)
    const eventsByDay: TimetableEvent[][] = Array(7).fill([]).map(() => [])

    events.forEach(event => {
        const date = parseISO(event.start_time)
        const dayIndex = getDayIndex(date)

        // Simple logic: If recurring, it shows up on that day of week.
        // If one-off, we *should* check the actual date match.
        // For this version (Next Level UI focus), we assume the backend returns relevant events.
        // (In a real app, you'd filtering by exact date range here)

        if (dayIndex >= 0 && dayIndex <= 6) {
            eventsByDay[dayIndex] = [...eventsByDay[dayIndex], event]
        }
    })

    // Sort by time
    eventsByDay.forEach(dayEvents => {
        dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    })

    return (
        <div className="space-y-6">
            {/* Desktop View (Grid) */}
            <div className="hidden md:grid grid-cols-7 gap-4 min-h-[600px]">
                {days.map((dayName, index) => {
                    const isDayToday = getDayIndex(new Date()) === index
                    return (
                        <div key={dayName} className="flex flex-col gap-3 min-w-0">
                            <div className={cn(
                                "p-3 rounded-xl text-center font-medium border transition-colors",
                                isDayToday
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-muted/50 border-transparent text-muted-foreground"
                            )}>
                                {dayName}
                            </div>

                            <div className={cn(
                                "flex-1 space-y-3 rounded-xl p-2 transition-colors min-h-[200px]",
                                isDayToday ? "bg-primary/5" : "bg-muted/30"
                            )}>
                                <AnimatePresence mode="popLayout">
                                    {eventsByDay[index].map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </AnimatePresence>
                                {eventsByDay[index].length === 0 && (
                                    <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm italic py-8">
                                        Free
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Mobile View (Tabs) */}
            <div className="md:hidden">
                <Tabs defaultValue={days[currentDayIndex] || "Monday"} value={days[currentDayIndex]} onValueChange={(val) => setCurrentDayIndex(days.indexOf(val))} className="w-full">
                    <div className="overflow-x-auto pb-4 scrollbar-none">
                        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 w-full sm:w-auto">
                            {days.map((day) => (
                                <TabsTrigger key={day} value={day} className="min-w-[80px]">
                                    {day.slice(0, 3)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDayIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 min-h-[400px]"
                        >
                            {eventsByDay[currentDayIndex]?.length > 0 ? (
                                eventsByDay[currentDayIndex].map(event => (
                                    <EventCard key={event.id} event={event} isMobile />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 border-2 border-dashed border-muted rounded-xl">
                                    <div className="p-4 rounded-full bg-muted/30">
                                        <Clock className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold">No classes today</p>
                                        <p className="text-sm text-muted-foreground">Enjoy your free time!</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </div>
        </div>
    )
}

function EventCard({ event, isMobile = false }: { event: TimetableEvent, isMobile?: boolean }) {
    const [editOpen, setEditOpen] = useState(false)

    // Convert hex color to rgba for background opacity
    const hexToRgba = (hex: string, alpha: number) => {
        // Remove hash if present
        hex = hex.replace('#', '');

        // Parse r, g, b
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const color = event.color || '#3b82f6'
    const bgStyle = { backgroundColor: hexToRgba(color, 0.15), borderColor: hexToRgba(color, 0.3) }
    const borderLeftStyle = { borderLeftColor: color }

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
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative group rounded-lg border transition-all cursor-pointer overflow-hidden",
                isMobile ? "p-4" : "p-3"
            )}
            style={{
                ...bgStyle,
                borderLeftWidth: '4px',
                ...borderLeftStyle
            }}
            onClick={() => setEditOpen(true)}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "font-semibold text-foreground/90 truncate",
                        isMobile ? "text-base" : "text-sm"
                    )}>
                        {event.title}
                    </h4>

                    <div className="mt-1 space-y-0.5">
                        <div className="flex items-center text-xs font-medium text-foreground/70">
                            <Clock className="h-3 w-3 mr-1.5 shrink-0" />
                            {startTime} - {endTime}
                        </div>
                        {event.location && (
                            <div className="flex items-center text-xs text-foreground/60 truncate">
                                <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
                                {event.location}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Hover Actions / Mobile Always Visible (if explicit action needed, but click-to-edit covers most) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 md:relative md:top-auto md:right-auto">
                    {/* We could add quick actions here if needed, but the card click opens edit */}
                </div>
            </div>

            <EventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
        </motion.div>
    )
}
