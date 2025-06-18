"use client"

import {useEffect, useRef, useState} from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {ChatMessageBubble} from "@/components/chat/chatMessageBubble";
import {ChatMessage} from "@/hooks/realtime/useSingleChat";

type ChatWindowProps = {
    messages: ChatMessage[]
    currentUserId: string
    onSendMessageAction: (message: string) => void
}

export default function ChatWindow({
                                       messages,
                                       currentUserId,
                                       onSendMessageAction
                                   }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [messageInput, setMessageInput] = useState<string>("")

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="flex flex-col h-full w-full border rounded-xl overflow-hidden shadow">
            <ScrollArea className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted scrollbar-hide">
                {messages.map((msg) => (
                    <ChatMessageBubble
                        key={msg.id}
                        message={msg}
                        currentUserId={currentUserId}
                    />
                ))}
                <div ref={bottomRef} />
            </ScrollArea>

            <form
           onSubmit={(e) => {
    e.preventDefault()
    onSendMessageAction(messageInput)
    setMessageInput("") // 🟢 Leert das Eingabefeld
  }}
                className="flex gap-2 p-4 border-t bg-background"
            >
                <Input
                    className="flex-1"
                    placeholder="Nachricht eingeben..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <Button type="submit">Senden</Button>
            </form>
        </div>
    )
}
