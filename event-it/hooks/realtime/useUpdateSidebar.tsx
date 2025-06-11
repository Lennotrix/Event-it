import {createClient} from "@/utils/supabase/client";
import {FirendGroup, FirendGroupMembers} from "@/types/exposed";
import {Dispatch, SetStateAction, useEffect} from "react";
import {useRealtimeListeners} from "@/hooks/realtime/useRealtimeListener";

export default function useUpdateSidebar({setGroups, userId}: { setGroups: Dispatch<SetStateAction<FirendGroup[]>>, userId: string | undefined }) {
    useRealtimeListeners(
        [
            {
                channel: `sidebar:friend_groups:${userId}`,
                event: "*",
                schema: "public",
                table: "friend_group_members",
                filter: `user_id=eq.${userId}`,
                handler: async (payload) => {
                    console.log("Realtime payload received:", payload);

                    const msg = payload.new as FirendGroupMembers | undefined;
                    const old = payload.old as FirendGroupMembers | undefined;
                    const eventType = payload.eventType;

                    const supabase = createClient();

                    if (eventType === "DELETE" && old) {
                        setGroups(prevGroups => (prevGroups || []).filter(g => g.id !== old.group_id));
                    } else if (eventType === "INSERT" && msg) {

                        const { data: senderData } = await supabase
                            .from("friend_groups")
                            .select("*")
                            .eq("id", msg.group_id)
                            .single();

                        if (senderData) {
                            setGroups(prevGroups => {
                                const groups = prevGroups || [];
                                if (groups.some(g => g.id === senderData.id)) return groups;
                                return [...groups, senderData as FirendGroup];
                            });
                        }
                    }
                }
            }
        ]
    )

    const fetchGroups = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User nicht gefunden:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("friend_group_members")
      .select("group_id, friend_groups(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Fehler beim Laden der Gruppen:", error);
      return;
    }

    setGroups(data.map((item) => item.friend_groups as FirendGroup));
  };

    useEffect(() => {
        fetchGroups().then().catch(console.error)
    }, [setGroups]);

  return { fetchGroups };

}