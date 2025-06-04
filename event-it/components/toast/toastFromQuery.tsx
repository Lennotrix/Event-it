'use client';

import { useEffect } from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export default function ToastFromQuery() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        if (AUTH_PATHS.includes(pathname)) return;

        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (success) {
            toast({
                title: "Success",
                description: decodeURIComponent(success),
                variant: "default",
            });
        }

        if (error) {
            toast({
                title: "Error",
                description: decodeURIComponent(error),
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    return null;
}
