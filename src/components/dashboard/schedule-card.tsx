"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Typography } from "@/components/ui/typography"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { Database } from "@/types/database.types"
import { format, formatDistance } from "date-fns"

type Timetable = Database['public']['Tables']['timetables']['Row']

interface ScheduleCardProps {
  schedule: Timetable[]
}

import { EventDialog } from "@/components/timetable/add-event-dialog"

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  if (schedule.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Your upcoming classes</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Typography variant="small" className="font-medium">
              No classes today
            </Typography>
            <Typography variant="muted" className="text-xs">
              Add your class schedule to never miss a lecture
            </Typography>
          </div>
          <EventDialog>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </EventDialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
        </CardTitle>
        <CardDescription>Next {schedule.length} classes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {schedule.map((item) => {
          const startTime = new Date(item.start_time)
          const endTime = new Date(item.end_time)
          const timeUntil = formatDistance(startTime, new Date(), { addSuffix: true })

          return (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-all duration-200 space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  <Typography variant="small" className="font-semibold">
                    {item.title}
                  </Typography>
                </div>
                <Badge variant="secondary" className="text-xs whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                  {timeUntil}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pl-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </span>
                {item.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
