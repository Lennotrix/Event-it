"use client";

import SingelChat, {DirectChatProps} from "@/components/chat/singleChat";
import GroupChat, {GroupChatProps} from "@/components/chat/GroupChat";

type ChatProps = GroupChatProps | DirectChatProps;

export default function Chat({eventId, recipientId, groupId }: ChatProps) {

    if (!eventId) {
        console.error("No eventId provided");
        return null;
    }
    if (!recipientId && groupId) {
        return <GroupChat eventId={eventId} groupId={groupId}/>
    }
    if (!groupId && recipientId) {
        return <SingelChat eventId={eventId} recipientId={recipientId} />
    }
    return (
        <>
            Jetzt hast es geschafft.
        </>
    );
}