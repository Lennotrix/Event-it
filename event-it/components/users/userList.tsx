"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserCard from "@/components/users/userCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePopup } from "@/components/provider/popupProvider";
import AddUserPopup from "@/components/users/addUserPopup";
import { useEffect, useState } from "react";

export default function UserList({
  userIds,
  groupId,
}: {
  userIds: string[];
  groupId: string;
}) {
  const { openPopup, closePopup } = usePopup();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [groupOwnerId, setGroupOwnerId] = useState<string>("");
  const [groupMemberCount, setGroupMemberCount] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Fehler beim Laden des Benutzers:", sessionError);
        return;
      }

      setCurrentUserId(user.id);

      const { data: group, error: groupError } = await supabase
        .from("friend_groups")
        .select("owner_id")
        .eq("id", groupId)
        .single();

      if (groupError || !group) {
        console.error("Fehler beim Laden der Gruppe:", groupError);
        return;
      }

      setGroupOwnerId(group.owner_id);
      setGroupMemberCount(userIds.length);
    }

    fetchData().catch(console.error);
  }, [groupId, userIds.length]);

  async function handleAddUser() {
    if (!groupId) {
      console.error("Group ID is required to add a user.");
      return;
    }

    openPopup(<AddUserPopup onCloseAction={closePopup} groupId={groupId} />);
  }

  return (
    <Card className={"max-w-1/4"}>
      <CardHeader>
        <CardTitle>Mitglieder</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea>
          {userIds.map((userId) => (
            <UserCard
              key={userId}
              userId={userId}
              groupId={groupId}
              currentUserId={currentUserId}
              groupOwnerId={groupOwnerId}
              groupMemberCount={groupMemberCount}
            />
          ))}
        </ScrollArea>
      </CardContent>

      <CardFooter className={"flex items-center justify-center"}>
        {currentUserId === groupOwnerId && (
          <Button variant={"outline"} onClick={handleAddUser}>
            <Plus />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
