import {useSingleChat} from "@/hooks/realtime/useSingleChat";
import {useSession} from "@/hooks/useSession";
import ChatWindow from "@/components/chat/chatWIndow";

export type DirectChatProps = { eventId: string; groupId?: never; recipientId: string };

export default function SingelChat({eventId, recipientId}: DirectChatProps) {
    const { user } = useSession();
    const { messages, sendMessage } = useSingleChat(eventId, recipientId, user?.id ?? "");

    return(
        <ChatWindow
            messages={messages}
            currentUserId={user?.id ?? ""}
            onSendMessageAction={sendMessage}/>
    )
}