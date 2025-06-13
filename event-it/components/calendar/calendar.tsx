"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { Calendar as BigCalendar, Views, View } from "react-big-calendar"
import {localizer, timeGutterFormat} from "@/lib/calendarLocalizer"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { parseISO } from "date-fns"
import { usePopup } from "@/components/provider/popupProvider"
import { DayViewDialog } from "@/components/calendar/dayViewPopup"
import {useRouter} from "next/navigation";

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loaded, setLoaded] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [currentView, setCurrentView] = useState<View>(Views.WEEK)
    const router = useRouter()
    const { openPopup } = usePopup()

    useEffect(() => {
        async function fetchEvents() {
            const supabase = createClient()
            const { data: user, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.error("Error fetching user:", userError)
                return
            }

            const { data, error } = await supabase
                .from("event_invitations")
                .select("*,events(*,venues(*))")
                .eq("user_id", user.user?.id)

            if (error) {
                console.error("Error fetching events:", error)
                return
            }

            setEvents(data)
            setLoaded(true)
        }

        fetchEvents().catch(console.error)
    }, [])

    const calendarEvents = useMemo(() => {
        return events.map((e) => {
            return {
                title: e.events.name || "Untitled Event",
                start: new Date(e.events.start_time),
                end: new Date(e.events.end_time),
                allDay: false,
                resource: e,
            }
        })
    }, [events])

    const handleSelectEvent = (event: any) => {
        const originalData = event.resource
        router.push(`/events/${originalData.event_id}`)
    }

    const handleNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate)
    }, [])

    const handleViewChange = useCallback((newView: View) => {
        setCurrentView(newView)
    }, [])

    return (
        <div className="h-full w-full p-4">
            {loaded && (
                <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view={currentView}
                    onView={handleViewChange}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    views={["month", "week", "day"]}
                    onSelectEvent={handleSelectEvent}
                    formats={{
                        timeGutterFormat: (date, culture, localizer) =>
                            localizer!.format(date, "HH:mm", culture),
                    }}
                />
            )}
        </div>
    )
}