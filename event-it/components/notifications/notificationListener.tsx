"use client";

import {useSession} from "@/hooks/useSession";
import {useEffect} from "react";
import {createClient} from "@/utils/supabase/client";
import {toast} from "sonner";
import {Database} from "@/types/supabase";
import {Accept, Decline} from "@/utils/invitation/client";

type Invitation = Database["public"]["Tables"]["event_invitations"]["Row"];

export function NotificationListener() {
    const { user } = useSession()

    useEffect(() => {
        if (!user?.id) return
        const supabase = createClient();

        const channel = supabase
            .channel("invitations")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "event_invitations",
                    filter: `user_id=eq.${user.id}`
                },
                async (payload) => {
                    const invitation = payload.new as Invitation

                    if (!invitation.event_id) return;

                    const {data: event, error } = await supabase
                        .from("events")
                        .select("name")
                        .eq("id", invitation.event_id)
                        .single()

                    if (error) {
                        console.error(error);
                    }

                    toast.info("Du wurdest zu einem Event eingeladen!", {
                        description: `Du wurdest zu ${event?.name} eingeladen!`,
                        action: {
                            label: "Annehmen",
                            onClick: () => {Accept(invitation.event_id!, user.id)}
                        },
                        cancel: {
                            label: "Ablehnen",
                            onClick: () => {Decline(invitation.event_id!, user.id)}
                        }
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    return null
}
