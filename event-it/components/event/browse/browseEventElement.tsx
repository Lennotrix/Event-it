"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Database } from "@/types/supabase"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export function CardDemo() {
    type EventWithVenue = Database["public"]["Tables"]["events"]["Row"] & {
        venues: Database["public"]["Tables"]["venues"]["Row"] | null
    }

    const [events, setEvents] = useState<EventWithVenue[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = await createClient()
            const { data, error } = await supabase
                .from("events")
                .select(`
                   *,
                   venues:venue_id (
                     *
                   )
                 `)
                .eq("status","published")

            if (error) {
                console.error("Fehler beim Laden der Events:", error)
            } else {
                setEvents(data || [])
            }
            console.log(data)
        }
        fetchEvents()
    }, [])

    // Hilfsfunktion zur Formatierung
    const formatGermanDate = (isoString: string) => {
        try {
            const date = new Date(isoString)
            const formatted = format(date, "EEE',' dd.MMMM',' HH:mm", { locale: de })
            return formatted.replace(/^(\w{2}),/, "$1.") // z. B. "Do." statt "Do"
        } catch {
            return isoString
        }
    }

    if (events.length === 0) {
        return <p>Loading...</p>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
                <Card
                    key={event.id}
                    className="w-full bg-white border border-gray-200 shadow-sm"
                >
                    <CardHeader>
                        <div className="relative">
                            <img
                                src={event.image_url?.toString()}
                                alt={event.name}
                                className="w-full h-40 object-cover rounded-t-md"
                            />
                        </div>
                        <CardTitle className="text-base font-semibold leading-snug">
                            {event.name}
                        </CardTitle>
                        <CardContent className="mt-1 text-sm text-muted-foreground text-left pl-0 pb-2 leading-relaxed max-h-24 overflow-auto">
                            {event.description}
                        </CardContent>
                        <CardDescription className="mt-1 text-sm text-muted-foreground">
                            {formatGermanDate(event.start_time)}<br />
                            {event.venues?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            Jetzt hinzufügen
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}