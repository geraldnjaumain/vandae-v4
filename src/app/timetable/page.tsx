import { AppLayout } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Calendar } from "lucide-react"
import { WeekView } from "@/components/timetable/week-view"
import { EventDialog } from "@/components/timetable/add-event-dialog"
import { getTimetableEvents } from "@/app/timetable/actions"

import { SyllabusImportDialog } from "@/components/timetable/syllabus-import-dialog"

export default async function TimetablePage() {
    const events = await getTimetableEvents()

    return (
        <AppLayout>
            <div className="container mx-auto p-4 md:p-6 max-w-[1600px]">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Typography variant="h1" className="flex items-center gap-2">
                                <Calendar className="h-8 w-8 text-indigo-600" />
                                Timetable
                            </Typography>
                            <Typography variant="muted">
                                Manage your weekly class schedule
                            </Typography>
                        </div>
                        <div className="flex gap-2">
                            <SyllabusImportDialog />
                            <EventDialog />
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border p-4 overflow-x-auto">
                        <WeekView events={events} />
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
