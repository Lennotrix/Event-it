import { createClient } from "@/utils/supabase/client";
import { Accept, Decline } from "@/utils/invitation/client";
import { toast } from "sonner";
import {useRealtimeListeners} from "@/hooks/realtime/useRealtimeListener";
import {EventInvitation} from "@/types/exposed";

export function useInvitationListener(userId: string | undefined) {
    const supabase = createClient();

    useRealtimeListeners(
        userId
            ? [
                {
                    channel: "invitations",
                    schema: "public",
                    table: "event_invitations",
                    event: "INSERT",
                    filter: `user_id=eq.${userId}`,
                    handler: async (payload) => {
                        const invitation = payload.new as EventInvitation;
                        if (!invitation.event_id) return;

                        const { data: event, error } = await supabase
                            .from("events")
                            .select("name")
                            .eq("id", invitation.event_id)
                            .single();

                        if (error) return console.error(error);

                        toast.info("Du wurdest zu einem Event eingeladen!", {
                            description: `Du wurdest zu ${event?.name} eingeladen!`,
                            action: {
                                label: "Annehmen",
                                onClick: () => Accept(invitation.event_id!, userId),
                            },
                            cancel: {
                                label: "Ablehnen",
                                onClick: () => Decline(invitation.event_id!, userId),
                            },
                        });
                    },
                },
            ]
            : [],
        !!userId
    );
}