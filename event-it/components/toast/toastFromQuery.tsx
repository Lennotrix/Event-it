'use client';

import { useEffect } from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {toast} from "sonner";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export default function ToastFromQuery() {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        if (AUTH_PATHS.includes(pathname)) return;

        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (success) {
            toast.success("Erfolg", {
                description: decodeURIComponent(success)
            });
        }

        if (error) {
            toast.error("Fehler", {
                description: decodeURIComponent(error)
            });
        }
    }, [searchParams, toast]);

    return null;
}
