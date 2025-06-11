"use client"

import {
    DialogTitle,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { FriendGroupInvitationsInsert } from "@/types/exposed"
import { createClient } from "@/utils/supabase/client"

export default function AddUserPopup({ onCloseAction, groupId }: { onCloseAction: () => void; groupId: string }) {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    async function handleAddUser() {
        if (!email) {
            toast.error("Bitte geben Sie eine E-Mail-Adresse ein.")
            return
        }

        const supabase = createClient()
        const { data: existingUser, error: userError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single()
        const { data: currentUser, error: currentUserError } = await supabase.auth.getUser()

        if (!existingUser || userError || !currentUser || currentUserError || !currentUser.user) {
            toast.error("Nutzer nicht gefunden oder Fehler beim Abrufen des Nutzers: " + (userError?.message || "Unbekannter Fehler"))
            return
        }

        const newUser: FriendGroupInvitationsInsert = {
            invited_user_id: existingUser.id,
            inviter_id: currentUser.user.id,
            message: message || "Ich möchte dich einladen!",
            group_id: groupId,
            status_id: "b14733dd-588d-4a1d-bb03-03ba1d14e98f",
        }

        const { error } = await supabase.from("friend_group_invites").insert(newUser)

        if (error) {
            toast.error("Fehler beim Hinzufügen des Nutzers: " + error.message)
            console.error("Error adding user:", error)
        } else {
            toast.success("Nutzer erfolgreich hinzugefügt!")
            onCloseAction()
        }
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Welchen Nutzer möchten Sie hinzufügen?</DialogTitle>
            </DialogHeader>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your-friend@example.com" />
            <Input value={message} onChange={(e) => setMessage(e.target.value)} type="text" placeholder="Ich möchte dich einladen!" />
            <DialogFooter>
                <Button onClick={handleAddUser}>Hinzufügen</Button>
                <Button onClick={onCloseAction}>Abbrechen</Button>
            </DialogFooter>
        </>
    )
}
