import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function useRealtimeListeners(configs: ListenerConfig[], enabled: boolean = true) {
    useEffect(() => {
        if (!enabled) return;

        const supabase = createClient();
        const channels = configs.map(cfg => {
            return supabase
                .channel(cfg.channel)
                .on(
                    // @ts-ignore
                    "postgres_changes",
                    {
                        event: cfg.event,
                        schema: cfg.schema,
                        table: cfg.table,
                        filter: cfg.filter,
                    },
                    cfg.handler
                )
                .subscribe();
        });

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, [enabled, JSON.stringify(configs)]);
}