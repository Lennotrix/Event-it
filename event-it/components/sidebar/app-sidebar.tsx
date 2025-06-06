"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Ticket, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AppSidebar() {
  const [groups, setGroups] = useState<
    { id: string; name: string; description: string | null }[]
  >([]);

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
    <Sidebar className="h-screen flex flex-col items-center py-6">
      {/* Logo */}
      <SidebarHeader>
        <div className="mb-6">
          <img src="/main.png" alt="Logo" className="w-8 h-8" />
        </div>
      </SidebarHeader>

      {/* Hauptmenü */}
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col items-center space-y-6">
            <SidebarMenuButton className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              <span>Kalendar</span>
            </SidebarMenuButton>

            <SidebarMenuButton className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              <span>Events</span>
            </SidebarMenuButton>
          </div>
        </SidebarGroup>

        {/* Gruppenliste */}
        <SidebarGroup>
          <div className="flex-1 mt-10 flex flex-col items-center space-y-3 overflow-auto">
            {groups.map((group) => (
              <SidebarMenuButton key={group.id} title={group.name}>
                {group.name}
              </SidebarMenuButton>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
