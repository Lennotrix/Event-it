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

export default function AppSidebar() {
  const [groups, setGroups] = useState<
    { id: string; name: string; description: string | null }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User nicht gefunden:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("friend_group_members")
        .select("group_id, friend_groups(name, description)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Fehler beim Laden der Gruppen:", error);
        return;
      }

      const formatted = data.map((entry) => ({
        id: entry.group_id,
        name: entry.friend_groups.name,
        description: entry.friend_groups.description,
      }));

      setGroups(formatted);
    };

    fetchGroups();
  }, []);

  return (
    <Sidebar>
      <SidebarHeader></SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex-1 mt-4 flex flex-col items-center space-y-3 overflow-auto">
            {groups.map((group) => (
              <SidebarMenuButton
                key={group.id}
                title={group.name}
                onClick={() =>
                  router.push(`/freinds/groups/create/${group.id}`)
                }
              >
                <span>{group.name}</span>
              </SidebarMenuButton>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              onClick={() => router.push("/freinds/groups/create")} // Dein Zielpfad hier
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
