import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {ChatMessage} from "@/hooks/realtime/useSingleChat";

type ChatMessageBubbleProps = {
    message: ChatMessage
    currentUserId: string
}

export function ChatMessageBubble({ message, currentUserId }: ChatMessageBubbleProps) {
    const isOwn = message.sender_id === currentUserId

    return (
        <div
            className={`flex items-end space-x-2 ${
                isOwn ? "justify-end" : "justify-start"
            }`}
        >
            {!isOwn && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar_url || "/fallback.png"} />
                </Avatar>
            )}
            <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
                    isOwn
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white text-black rounded-bl-none"
                }`}
            >
                <p className="text-sm">{message.content}</p>
            </div>
            {isOwn && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar_url || "/fallback.png"} />
                </Avatar>
            )}
        </div>
    )
}
