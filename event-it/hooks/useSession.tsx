import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";

export function useSession() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_, session) => setUser(session?.user ?? null)
        )

        return () => listener?.subscription.unsubscribe()
    }, [])

    return { user }
}