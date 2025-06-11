"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Calendar } from "@/components/ui/calendar"
import { isSameDay, parseISO, isWithinInterval, eachDayOfInterval } from "date-fns"
import { usePopup } from "@/components/provider/popupProvider"
import { DayViewDialog } from "@/components/calendar/dayViewPopup"

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [events, setEvents] = useState<any[]>([])
    const [loaded, setLoaded] = useState(false)
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

    const eventDatesByStatus: Record<
        "pending" | "accepted" | "declined" | "maybe" | "expired",
        Date[]
    > = {
        pending: [],
        accepted: [],
        declined: [],
        maybe: [],
        expired: [],
    }

    // Expand events over their date ranges
    events?.forEach((e) => {
        const status = e.status as keyof typeof eventDatesByStatus
        const start = parseISO(e.events.start_time)
        const end = parseISO(e.events.end_time)

        const allDates = eachDayOfInterval({ start, end })
        eventDatesByStatus[status].push(...allDates)
    })

    const handleDayClick = (day: Date) => {
        const matchedEvents = events.filter((e) => {
            const start = parseISO(e.events.start_time)
            const end = parseISO(e.events.end_time)
            return isWithinInterval(day, { start, end })
        })

        if (matchedEvents.length > 0) {
            setSelectedDate(day)
        } else {
            setSelectedDate(null)
        }

        openPopup(<DayViewDialog date={day ?? new Date()} />)
    }

    function getStatusesForDay(day: Date): string[] {
        const statuses: string[] = []

        for (const status of Object.keys(eventDatesByStatus)) {
            if ((eventDatesByStatus as any)[status].some((d: Date) => isSameDay(d, day))) {
                statuses.push(status)
            }
        }

        return statuses
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {loaded && (
                <Calendar
                    weekStartsOn={1}
                    animate={true}
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onDayClick={handleDayClick}
                    modifiers={{
                        pending: (date) =>
                            eventDatesByStatus.pending.some((d) => isSameDay(d, date)),
                        accepted: (date) =>
                            eventDatesByStatus.accepted.some((d) => isSameDay(d, date)),
                        declined: (date) =>
                            eventDatesByStatus.declined.some((d) => isSameDay(d, date)),
                        maybe: (date) =>
                            eventDatesByStatus.maybe.some((d) => isSameDay(d, date)),
                        expired: (date) =>
                            eventDatesByStatus.expired.some((d) => isSameDay(d, date)),
                    }}
                    modifiersClassNames={{
                        pending: "bg-yellow-200 text-yellow-800 rounded",
                        accepted: "bg-green-200 text-green-800 rounded",
                        declined: "bg-red-200 text-red-800 rounded",
                        maybe: "bg-yellow-200 text-yellow-800 rounded",
                        expired: "bg-gray-200 text-gray-800 rounded",
                    }}
                />
            )}
        </div>
    )
}
