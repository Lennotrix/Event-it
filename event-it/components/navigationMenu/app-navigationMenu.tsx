"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/navigationMenu/breadcrumps";
import { ThemeToggle } from "@/components/navigationMenu/themeToggle";
import { Label } from "@/components/ui/label";
import EditUserPopup from "@/components/users/editUserPopup";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TopNav() {
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
    avatar_url: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
  } | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, first_name, last_name, bio")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setUserData({
            id: data.id,
            username: data.username,
            avatar_url: data.avatar_url ?? "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            bio: data.bio || "",
          });
        }

        const { data: invites } = await supabase
          .from("friend_group_invites")
          .select("id")
          .eq("invited_user_id", user.id)
          .is("responded_at", null);

        setInvitationCount(invites?.length ?? 0);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <header className="w-full flex items-center justify-between p-4 border-b">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xl font-bold">
          <Image src="/main.png" alt="Logo" width={55} height={55} />
        </div>
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/events")}>
            Events
          </Button>
          <Button variant="outline" onClick={() => router.push("/events/create")}>
            Event erstellen
          </Button>
        </div>

        <ThemeToggle />

        {userData && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar>
                    <AvatarImage src={
                      userData.avatar_url
                          ? userData.avatar_url
                          : "/images/usericon.png"
                    }
                    />
                  </Avatar>
                  {invitationCount > 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-4">
                <DropdownMenuItem
                  className="text-sm text-muted-foreground"
                  disabled
                >
                  <Label>Eingeloggt als: {userData.username}</Label>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Profil bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/invitations")}>
                  Einladungen{invitationCount > 0 && ` (${invitationCount})`}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/events/me")}>
                  Meine Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Ausloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <EditUserPopup
                  userId={userData.id}
                  currentValues={{
                    username: userData.username,
                    avatar_url: userData.avatar_url,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    bio: userData.bio,
                  }}
                  onCloseAction={() => setEditOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </header>
  );
}
