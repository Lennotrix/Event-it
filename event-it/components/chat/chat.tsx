"use client";

import SingelChat, {DirectChatProps} from "@/components/chat/singleChat";

type GroupChatProps = { eventId: string; groupId: string; recipientId?: never };

type ChatProps = GroupChatProps | DirectChatProps;

export default function Chat({eventId, recipientId, groupId }: ChatProps) {

    if (!eventId) {
        console.error("No eventId provided");
        return null;
    }
    if (!recipientId) {
        return null;
    }
    if (!groupId) {
        return <SingelChat eventId={eventId} recipientId={recipientId} />
    }
    return (
        <>
            Jetzt hast es geschafft.
        </>
    );
}