import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { parseISO, isSameDay, differenceInMinutes, startOfDay, endOfDay } from "date-fns"
import {useRouter} from "next/navigation";

export function DayViewDialog({ date }: { date: Date }) {
    const [eventInvitations, setEventInvitations] = useState<any[]>([])
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const router = useRouter()

    useEffect(() => {
        async function fetchEvents() {
            const supabase = createClient()
            const { data: user, error: userError } = await supabase.auth.getUser()

            if (userError || !user) return

            const { data, error } = await supabase
                .from("event_invitations")
                .select("*, events(*)")
                .eq("user_id", user.user.id)

            if (error) return

            setEventInvitations(data ?? [])
        }

        fetchEvents()
    }, [date])

    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const dayEvents = eventInvitations.filter((e) => {
        const start = new Date(e.events.start_time)
        const end = new Date(e.events.end_time)
        return start <= dayEnd && end >= dayStart // event intersects this day
    })

    const getOverlappingGroups = (events: any[]) => {
        const sorted = [...events].sort(
            (a, b) => new Date(a.events.start_time).getTime() - new Date(b.events.start_time).getTime()
        )
        const groups: any[][] = []
        let currentGroup: any[] = []

        sorted.forEach((event) => {
            const start = new Date(event.events.start_time)
            const end = new Date(event.events.end_time)

            if (
                currentGroup.length === 0 ||
                new Date(currentGroup[currentGroup.length - 1].events.end_time) > start
            ) {
                currentGroup.push(event)
            } else {
                groups.push(currentGroup)
                currentGroup = [event]
            }
        })

        if (currentGroup.length > 0) groups.push(currentGroup)
        return groups
    }

    const statusColorMap: Record<string, string> = {
        accepted: "bg-green-500",
        pending: "bg-yellow-400",
        declined: "bg-red-400",
        maybe: "bg-blue-400",
        expired: "bg-gray-400",
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Schedule for {date?.toDateString()}</DialogTitle>
                <DialogDescription>Events shown by hour</DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[700px] w-full mt-4 rounded border relative">
                <div className="relative h-[2400px] pl-12"> {/* 100px per hour = 2400px */}
                    {/* Hour lines */}
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full border-b border-muted h-[100px]"
                            style={{ top: `${hour * 100}px` }}
                        >
                            <div className="absolute -left-12 w-10 text-right pr-2 text-xs text-muted-foreground">
                                {hour.toString().padStart(2, "0")}:00
                            </div>
                        </div>
                    ))}

                    {/* Event blocks */}
                    {getOverlappingGroups(dayEvents).flatMap((group, groupIndex) => {
                        const width = 100 / group.length

                        return group.map((invitation, i) => {
                            const event = invitation.events
                            const start = new Date(event.start_time)
                            const end = new Date(event.end_time)

                            const clampedStart = start < dayStart ? dayStart : start
                            const clampedEnd = end > dayEnd ? dayEnd : end

                            const minutesFromStart = differenceInMinutes(clampedStart, dayStart)
                            const durationMinutes = Math.max(30, differenceInMinutes(clampedEnd, clampedStart)) // Minimum height

                            return (
                                <div
                                    key={invitation.id}
                                    className={`absolute p-2 text-white text-sm rounded shadow ${statusColorMap[invitation.status] || "bg-slate-500"}`}
                                    onClick={() => router.push(`/events/${event.id}`)}
                                    style={{
                                        top: `${(minutesFromStart / 60) * 100}px`,
                                        height: `${(durationMinutes / 60) * 100}px`,
                                        left: `calc(${i * width}% + 48px)`, // +48px for label space
                                        width: `calc(${width}% - 8px)`, // spacing between events
                                    }}
                                >
                                    <strong>{event.name}</strong>
                                    <div className="text-xs">
                                        {start.toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                        {end.toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            )
                        })
                    })}
                </div>
            </ScrollArea>
        </>
    )
}
