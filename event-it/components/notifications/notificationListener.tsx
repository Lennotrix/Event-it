"use client";

import { useSession } from "@/hooks/useSession";
import { useInvitationListener } from "@/hooks/realtime/useInvitationListener";

export function NotificationListener() {
    const { user } = useSession();

    useInvitationListener(user?.id);

    return null;
}
