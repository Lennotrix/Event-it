"use client"

import {Eventelement} from "@/components/event/browse/browseEventElement";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {EventWithVenue} from "@/types/exposed";
import EventDetailsPopup from "@/components/event/EventDetailsPopup";
import {Button} from "@/components/ui/button";
import {usePopup} from "@/components/provider/popupProvider";
import AddEventPopup from "@/components/event/browse/addEventPopup";

export default function BrowseEvent() {
    const {openPopup, closePopup} = usePopup();
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

    async function handleAddEvent(eventId: string) {
        const supabase = await createClient()
        const {data: profileData, error: profileError} = await supabase.auth.getUser();
        if (profileError || !profileData.user) {
            console.error("Fehler beim Abrufen des Profils:", profileError)
            return
        }
        openPopup(
            <AddEventPopup eventId={eventId} onCloseAction={closePopup}/>,
            "Event hinzufügen",
            "")
    }

    if (events.length === 0) {
        return <p>Keine Events gefunden</p>
    }

        return (
        <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map((event, index) => (
            <Eventelement key={index} event={event}>
                <Button className="" onClick={() => {handleAddEvent(event.id)}}>
                    Jetzt hinzufügen
                </Button>
            </Eventelement>
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