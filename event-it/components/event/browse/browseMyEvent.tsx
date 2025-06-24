"use client"

import {Eventelement} from "@/components/event/browse/browseEventElement";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {EventWithVenue} from "@/types/exposed";
import {Button} from "@/components/ui/button";
import {useRouter } from "next/navigation";
import {Settings, Trash, UserPlus} from "lucide-react";
import {usePopup} from "@/components/provider/popupProvider";
import AddEventPopup from "@/components/event/browse/addEventPopup";

export default function BrowseMyEvent() {

    const router = useRouter()
    const [events, setEvents] = useState<EventWithVenue[]>([])
    const { openPopup, closePopup } = usePopup();

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

    const handleDelete = async (id:string) => {

        const supabase = await createClient()
        const { error } = await supabase
            .from("events") // Tabelle in Supabase
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Fehler beim Löschen:", error.message);
        } else {
            window.location.reload();
        }
    };

    const handleAddFriend = async (event: EventWithVenue) => {
        openPopup(
            <AddEventPopup eventId={event.id} onCloseAction={closePopup} />,
            "Freunde hinzufügen",
            `Welche Freunde möchten Sie zu "${event.name}" hinzufügen?`);
    }


    if (events.length === 0) {
        return <p>Loading...</p>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
                <Eventelement key={index} event={event}>
                    <div className="flex flex-wrap justify-between items-center w-full gap-2">
                        <div className={"flex gap-2 items-center"}>
                            <Button onClick={() => router.push(`/events/create/${event.id}`)}>
                                <Settings/> Bearbeiten
                            </Button>
                            <Button onClick={() => handleAddFriend(event)}>
                                <UserPlus/> Hinzufügen
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(event.id)}
                            >
                                <Trash/>
                                Löschen
                            </Button>
                        </div>
                    </div>
                </Eventelement>
            ))}
        </div>
    )
}