"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Invite = {
  id: string;
  group_id: string;
  group_name: string;
  message: string | null;
};

export default function InvitationsPage() {
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    const fetchInvites = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("friend_group_invites")
        .select("id, group_id, message, friend_groups(name)")
        .eq("invited_user_id", user.id)
        .is("responded_at", null);

      const mapped = data?.map((inv: any) => ({
        id: inv.id,
        group_id: inv.group_id,
        message: inv.message,
        group_name: inv.friend_groups?.name ?? "Unknown Group",
      }));

      setInvites(mapped ?? []);
    };

    fetchInvites();
  }, []);

  const handleAction = async (inviteId: string, accepted: boolean) => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (accepted) {
      const { data: invite } = await supabase
        .from("friend_group_invites")
        .select("group_id")
        .eq("id", inviteId)
        .single();

      if (!invite) return;

      await supabase.from("friend_group_members").insert([
        {
          group_id: invite.group_id,
          user_id: user.id,
        },
      ]);
    }

    await supabase
      .from("friend_group_invites")
      .update({ responded_at: new Date().toISOString() })
      .eq("id", inviteId);

    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Einladungen</h1>
      {invites.length === 0 ? (
        <p>Aktuell keine Einladungen</p>
      ) : (
        invites.map((inv) => (
          <Card key={inv.id}>
            <CardHeader>
              <CardTitle>{inv.group_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inv.message && <p>{inv.message}</p>}
              <div className="flex gap-2">
                <Button onClick={() => handleAction(inv.id, true)}>
                  Akzeptieren
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(inv.id, false)}
                >
                  Ablehnen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
