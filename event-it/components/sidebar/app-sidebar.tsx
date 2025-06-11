"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {FirendGroup} from "@/types/exposed";
import useUpdateSidebar from "@/hooks/realtime/useUpdateSidebar";
import {useSession} from "@/hooks/useSession";
import {User} from "@supabase/auth-js";

export default function AppSidebar() {
  const [groups, setGroups] = useState<FirendGroup[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useUpdateSidebar({setGroups, userId: user?.id});

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Fehler beim Abrufen des Benutzers:", error);
        return;
      }
      setUser(user);
    };
    fetchUser().catch(console.error);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader></SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex-1 mt-4 flex flex-col items-center space-y-3 overflow-auto">
            {groups.map((group, index) => (
              <SidebarMenuButton
                key={index}
                title={group?.name || "Unbenannte Gruppe"}
                onClick={() =>
                  router.push(`/friends/groups/${group.id}`)
                }
              >
                <span>{group?.name || "Unbekannte Gruppe"}</span>
              </SidebarMenuButton>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              onClick={() => router.push("/friends/groups/create")} // Dein Zielpfad hier
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
