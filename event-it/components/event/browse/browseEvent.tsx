"use client"

import {Eventelement} from "@/components/event/browse/browseEventElement";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {EventWithVenue} from "@/types/exposed";
import EventDetailsPopup from "@/components/event/EventDetailsPopup";

export default function BrowseEvent() {

    //const [events, setEvents] = useState<EventWithVenue[]>([])

    const [events, setEvents] = useState<EventWithVenue[]>([])
    // State für geöffnete Popup
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)


    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = await createClient()
            const {data, error} = await supabase
                .from("events")
                .select(`
                   *,
                   venues:venue_id (
                     *
                   )
                 `)
                .eq("status", "published")
                .eq("public",true)

            if (error) {
                console.error("Fehler beim Laden der Events:", error)
            } else {
                setEvents(data || [])
            }
            console.log(data)
        }
        fetchEvents()
    }, [])

    if (events.length === 0) {
        return <p>Loading...</p>
    }

        return (
        <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map(event => (
          <Eventelement
            key={event.id}
            event={event}
            onImageClick={() => setSelectedEventId(event.id)}
          />
        ))}
      </div>

            {selectedEventId && (
            <EventDetailsPopup
                eventId={selectedEventId}
                onClose={() => setSelectedEventId(null)}
            />
            )}
        </>
        )


}