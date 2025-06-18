import {DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {EventInvitationInsert} from "@/types/exposed";
import {toast} from "sonner";

export default function AddEventPopup({eventId, onCloseAction}:
{
    eventId: string,
    onCloseAction: () => void
}) {
    const [friendGroups, setFriendGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<string>("");

    useEffect(() => {
        async function fetchFriendGroups() {
            const supabase = createClient();
            const { data: profileData, error: profileError } = await supabase.auth.getUser();

            if (profileError || !profileData.user) {
                console.error("Fehler beim Abrufen des Profils:", profileError);
                return;
            }

            const { data, error } = await supabase
                .from("friend_group_members")
                .select("*,friend_groups(*)")
                .eq("user_id", profileData.user?.id);

            if (error) {
                console.error("Fehler beim Laden der Freundesgruppen:", error);
            } else {
                setFriendGroups(data || []);
            }
        }

        fetchFriendGroups().catch(console.error);
    }, []);

    async function handleAddFriend(){
        if (!selectedGroup && !selectedFriend) {
            console.error("Bitte wählen Sie eine Gruppe oder geben Sie eine E-Mail-Adresse ein.");
            return;
        }

        const supabase = createClient();
        const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();
        if (currentUserError || !currentUser.user) {
            console.error("Fehler beim Abrufen des aktuellen Benutzers:", currentUserError);
            return;
        }

        let newInvite: EventInvitationInsert[];
        if(selectedGroup){
            const { data: groupMembers, error: groupError } = await supabase
                .from("friend_group_members")
                .select("user_id")
                .eq("group_id", selectedGroup.id);

            if (groupError) {
                console.error("Fehler beim Laden der Gruppenmitglieder:", groupError);
                return;
            }

            const usersToInvite = [...groupMembers.map(member => member.user_id)];

            const uniqueUserIds = new Set(usersToInvite);

            uniqueUserIds.add(currentUser.user.id);

            newInvite = Array.from(uniqueUserIds).map(userId => ({
                inviter_id: null,
                group_id: selectedGroup.id,
                status: userId === currentUser.user?.id ? "accepted" : "pending",
                user_id: userId,
                event_id: eventId
            }));
        } else if(selectedFriend) {
            const { data: existingUser, error: userError } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", selectedFriend)
                .single();

            if (userError || !existingUser) {
                console.error("Fehler beim Abrufen des Nutzers:", userError);
                return;
            }

            const userToInvite = [existingUser.id];
            const uniqueUserIds = new Set(userToInvite);

            uniqueUserIds.add(currentUser.user.id);

            newInvite = Array.from(uniqueUserIds).map(userId => ({
                inviter_id: currentUser.user?.id,
                group_id: null,
                status: userId === currentUser.user?.id ? "accepted" : "pending",
                user_id: userId,
                event_id: eventId
            }));
        } else {
            toast.error("Bitte wählen Sie eine Gruppe und geben Sie eine E-Mail-Adresse ein.");
            return;
        }

        const { error } = await supabase.from("event_invitations").insert(newInvite);

        if (error) {
            console.error("Fehler beim Hinzufügen des Freundes:", error);
        } else {
            toast.success("Freund(e) erfolgreich hinzugefügt!");
            onCloseAction();
        }
    }

    return (
        <>
            <Label>Freundesgruppe</Label>
            <Select
                value={selectedGroup?.id ?? ""}
                onValueChange={(val) => {
                    const group = friendGroups.find(g => g.friend_groups?.id === val);
                    setSelectedGroup(group?.friend_groups ?? null);
                }}
                disabled={!!selectedFriend}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Gruppe auswählen" />
                </SelectTrigger>
                <SelectContent>
                    {friendGroups.map((group) => (
                        <SelectItem key={group.friend_groups.id} value={group.friend_groups.id}>
                            {group.friend_groups.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div>
                <Label>Freund einladen</Label>
                <Input type={"email"} placeholder={"friend@example.com"} disabled={!!selectedGroup} value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}/>
            </div>
            <DialogFooter>
                <Button onClick={handleAddFriend}>Hinzufügen</Button>
            </DialogFooter>
        </>
    )
}