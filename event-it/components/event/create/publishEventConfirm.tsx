'use client'

import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/exposed";
import {DialogFooter, DialogTitle} from "@/components/ui/dialog";
import {toast} from "sonner";

export default function PublishEventConfirm({
                                                eventId,
                                                closeAction,
                                            }: {
    eventId: string
    closeAction: () => void
}) {
    const [event, setEvent] = useState<Event | null>(null);

    useEffect(() => {
        async function fetchEvent() {
            const supabase = createClient();
            const { error, data: event } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (error) {
                console.error("Error fetching event:", error);
                toast.error("Fehler",{
                    description: "Beim Laden des Events ist ein Fehler aufgetreten."
                });
                return;
            }

            setEvent(event);
        }

        fetchEvent().then().catch(console.error);
    }, []);

    async function handlePublish() {
        if (!event) return;

        const supabase = createClient();
        const { error } = await supabase
            .from("events")
            .update({ status: "published" })
            .eq("id", eventId);

        if (error) {
            console.error("Error publishing event:", error);
            toast.error("Fehler",{
                description: "Beim Veröffentlichen des Events ist ein Fehler aufgetreten."
            });
            return;
        }

        toast.success("Erfolgreich",{
            description: "Das Event wurde erfolgreich veröffentlicht."
        });

        closeAction();
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2 pt-2">
                <Label className="text-lg font-semibold">{event?.name}</Label>
                <div className="flex items-center gap-2">
                    <Label>Von:</Label>
                    <Label>{new Date(event?.start_time ?? "").toLocaleDateString("de-DE")}</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Label>Bis:</Label>
                    <Label>{new Date(event?.end_time ?? "").toLocaleDateString("de-DE")}</Label>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={closeAction}>Abbrechen</Button>
                <Button onClick={handlePublish}>Veröffentlichen</Button>
            </DialogFooter>
        </div>
    );
}
