import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {MessageRow} from "@/types/exposed";
import {useRealtimeListeners} from "@/hooks/realtime/useRealtimeListener";

export type ChatMessage = MessageRow & {
    sender: {
        username: string
        avatar_url: string | null
    }
}

export default function useGroupChat(eventId: string, groupId: string, currentUserId: string) {
    const supabase = createClient()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const messagesRef = useRef<ChatMessage[]>([])

    useRealtimeListeners(
        [
            {
                channel: `chat:group:${eventId}:${groupId}`,
                event: "*",
                schema: "public",
                table: "event_chats",
                filter: `event_id=eq.${eventId}`,
                handler: async (payload) => {
                    const msg = payload.new as MessageRow

                    const { data: senderData } = await supabase
                        .from("profiles")
                        .select("username, avatar_url")
                        .eq("id", msg.sender_id)
                        .single()

                    const enriched: ChatMessage = {
                        ...msg,
                        sender: senderData || {
                            username: "Unbekannt",
                            avatar_url: null
                        }
                    }

                    messagesRef.current = [...messagesRef.current, enriched]
                    setMessages([...messagesRef.current])
                }
            }
        ]
    )

    useEffect(() => {
        if (!eventId || !groupId || !currentUserId) return

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("event_chats")
                .select("*, sender:profiles!sender_id(username, avatar_url)")
                .eq("event_id", eventId)
                .or(`group_id.eq.${groupId},user_id.eq.${currentUserId}`)
                .order("created_at", { ascending: true })

            if (!error && data) {
                messagesRef.current = data
                setMessages(data)
            }
        }

        fetchMessages()
    }, [eventId, groupId, currentUserId])

    const sendMessage = async (content: string) => {
        const { error } = await supabase.from("event_chats").insert({
            event_id: eventId,
            group_id: groupId,
            sender_id: currentUserId,
            content
        })

        if (error) {
            console.error("Send failed:", error)
        }
    }

    return {
        messages,
        sendMessage
    }
}