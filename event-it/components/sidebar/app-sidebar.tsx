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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Fehler beim Laden des Benutzers.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("friend_group_members")
        .select("group_id, friend_groups(name, description)")
        .eq("user_id", user.id);

      if (error) {
        setError("Fehler beim Laden der Gruppen.");
      } else {
        const formatted = data.map((entry) => ({
          id: entry.group_id,
          name: entry.friend_groups.name,
          description: entry.friend_groups.description,
        }));
        setGroups(formatted);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  return (
    <Sidebar>
      <SidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <div className="flex-1 mt-4 flex flex-col items-center space-y-3 overflow-auto w-full">
            {loading && (
              <p className="text-sm text-muted-foreground">Lade Gruppen...</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && groups.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Keine Gruppen vorhanden
              </p>
            )}

            {groups.map((group) => (
              <SidebarMenuButton
                key={group.id}
                title={group.name}
                onClick={() => router.push(`/friends/groups/${group.id}`)}
                className="w-full"
              >
                {group.name}
              </SidebarMenuButton>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full mt-2"
              onClick={() => router.push("/friends/groups/create")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
