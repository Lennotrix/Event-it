"use client"

import {Eventelement} from "@/components/event/browse/browseEventElement";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {EventWithVenue} from "@/types/exposed";
import {Button} from "@/components/ui/button";
import {useRouter } from "next/navigation";

export default function BrowseMyEvent() {

    const router = useRouter()
    const [events, setEvents] = useState<EventWithVenue[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = await createClient()

            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error("Fehler beim Abrufen des Benutzers:", userError?.message)
                return
            }
            console.log(user)

            const {data, error} = await supabase
                .from("events")
                .select(`
                   *,
                   venues:venue_id (
                     *
                   )
                 `)
                .eq("creator_id",user.id)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
                <Eventelement key={index} event={event}>
                    <Button onClick={() => router.push(`/events/create/${event.id}`)}>
                        Event bearbeiten
                    </Button>
                </Eventelement>
            ))}
        </div>
    )
}