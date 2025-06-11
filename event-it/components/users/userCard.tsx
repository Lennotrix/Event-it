"use client";

import { Profiles } from "@/types/exposed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserCard({
  userId,
  groupId,
  currentUserId,
  groupOwnerId,
  groupMemberCount,
}: {
  userId: string;
  groupId: string;
  currentUserId: string;
  groupOwnerId: string;
  groupMemberCount: number;
}) {
  const [user, setUser] = useState<Profiles | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;

      const supabase = createClient();
      const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      setUser(user);
    }

    fetchUser().catch(console.error);
  }, [userId]);

  async function handleLeaveGroup() {
    const supabase = createClient();
    const { error } = await supabase
      .from("friend_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Fehler beim Verlassen der Gruppe:", error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleLeaveGroupAsOwner() {
    const supabase = createClient();

    if (groupMemberCount > 1) {
      const { data: members, error } = await supabase
        .from("friend_group_members")
        .select("user_id")
        .neq("user_id", currentUserId)
        .eq("group_id", groupId)
        .limit(1);

      if (error || !members || members.length === 0) {
        console.error("Kein anderer Gruppenmitglied gefunden");
        return;
      }

      const newOwnerId = members[0].user_id;

      const { error: updateError } = await supabase
        .from("friend_groups")
        .update({ owner_id: newOwnerId })
        .eq("id", groupId);

      if (updateError) {
        console.error(
          "Fehler beim Übertragen der Eigentümerschaft:",
          updateError
        );
        return;
      }

      await handleLeaveGroup();
    } else {
      await handleDeleteGroup();
    }
  }

  async function handleDeleteGroup() {
    const supabase = createClient();
    const { error } = await supabase
      .from("friend_groups")
      .delete()
      .eq("id", groupId);

    if (error) {
      console.error("Fehler beim Löschen der Gruppe:", error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleKickUser() {
    if (userId === groupOwnerId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("friend_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      console.error("Fehler beim Entfernen des Nutzers aus der Gruppe:", error);
    }
  }

  if (!user) {
    return (
      <Card className="h-32 flex items-center justify-center">
        Lade Nutzer...
      </Card>
    );
  }

  return (
    <Card className="w-full relative">
      {/* Krone oben links, wenn Gruppenowner */}
      {userId === groupOwnerId && (
        <div className="absolute top-2 left-2">
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      <CardHeader>
        {(currentUserId === groupOwnerId || currentUserId === userId) && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {currentUserId === groupOwnerId ? (
                  <>
                    {userId !== currentUserId && (
                      <DropdownMenuItem onClick={handleKickUser}>
                        Aus Gruppe entfernen
                      </DropdownMenuItem>
                    )}
                    {userId === currentUserId && (
                      <>
                        <DropdownMenuItem onClick={handleLeaveGroupAsOwner}>
                          Gruppe verlassen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeleteGroup}>
                          Gruppe löschen
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                ) : currentUserId === userId ? (
                  <DropdownMenuItem onClick={handleLeaveGroup}>
                    Gruppe verlassen
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <Avatar>
          <AvatarImage src={user.avatar_url ?? undefined} />
        </Avatar>
        <CardTitle>{user.username}</CardTitle>
        <CardDescription>
          {user.first_name} {user.last_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label>{user.bio}</Label>
        <Label
          className={
            user.is_active ? "text-destructive-foreground" : "text-green-500"
          }
        >
          {user.is_active ? "Aktiv" : "Inaktiv"}
        </Label>
      </CardContent>
    </Card>
  );
}
