import {useSession} from "@/hooks/useSession";
import ChatWindow from "@/components/chat/chatWIndow";
import useGroupChat from "@/hooks/realtime/useGroupChat";

export type GroupChatProps = { eventId: string; groupId: string; recipientId?: never };

export default function GroupChat({eventId, groupId}: GroupChatProps) {
    const { user } = useSession();
    const { messages, sendMessage } = useGroupChat(eventId, groupId, user?.id ?? "");

    return(
        <ChatWindow
            messages={messages}
            currentUserId={user?.id ?? ""}
            onSendMessageAction={sendMessage}/>
    )
}