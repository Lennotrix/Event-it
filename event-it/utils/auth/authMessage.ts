import {AuthMessage} from "@/types/auth/authTypes";

export function getAuthMessage(
    searchParams?: { [key: string]: string | string[] }
): AuthMessage {
    if (!searchParams) return null;

    if (typeof searchParams.error === "string") {
        return { type: "error", text: decodeURIComponent(searchParams.error) };
    }
    if (typeof searchParams.success === "string") {
        return { type: "success", text: decodeURIComponent(searchParams.success) };
    }

    return null;
}
