"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserList from "@/components/users/userList";
import EventDetailsPopup from "@/components/event/EventDetailsPopup";

export default function FriendGroupDetail({ groupId }: { groupId: string }) {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitedEventsRaw, setInvitedEventsRaw] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    groupId: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: group, error } = await supabase
        .from("friend_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      const { data: members, error: membersError } = await supabase
        .from("friend_group_members")
        .select("*")
        .eq("group_id", groupId);

      const { data: invitedEventsRaw, error: eventError } = await supabase
        .from("event_invitations")
        .select("event_id, events(name, start_time)")
        .eq("group_id", groupId);

      if (error || membersError || eventError || !members || !group) {
        console.error(
          "Error fetching group or members or events:",
          error || membersError || eventError
        );
        return;
      }

      setGroup(group);
      setMembers(members);
      setInvitedEventsRaw(invitedEventsRaw);
    };

    fetchData().catch(console.error);
  }, [groupId]);

  const seen = new Set();
  const invitedEvents = invitedEventsRaw.filter((inv) => {
    if (seen.has(inv.event_id)) return false;
    seen.add(inv.event_id);
    return true;
  });

  if (!group) {
    return (
      <Card className="h-32 flex items-center justify-center">
        Lade Gruppe...
      </Card>
    );
  }

  return (
    <div className="w-full grid grid-cols-[2fr_1fr] grid-rows-[auto_1fr_auto] gap-x-[10px] gap-y-[10px]">
      {/* Gruppenbeschreibung */}
      <Card className="col-start-1 row-start-1">
        <CardHeader>
          <CardTitle>{group.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{group.description || "Keine Beschreibung vorhanden."}</p>
          <p className="text-sm text-muted-foreground">
            Mitglieder: {members.length} <br />
            Events: {invitedEvents.length} <br />
            Erstellt am: {new Date(group.created_at).toLocaleDateString()}{" "}
            <br />
            Status: {group.is_active ? "Aktiv" : "Inaktiv"}
          </p>
        </CardContent>
      </Card>

      {/* User-Liste */}
      <div className="col-start-2 row-start-1">
        <UserList
          userIds={members.map((member) => member.user_id)}
          groupId={groupId}
        />
      </div>

      {/* Eventliste */}
      <Card className="col-start-1 row-start-2 col-span-2">
        <CardHeader>
          <CardTitle>Events, zu denen die Gruppe eingeladen ist</CardTitle>
        </CardHeader>
        <CardContent>
          {invitedEvents.length === 0 ? (
            <p>Keine Einladungen zu Events.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {invitedEvents.map((inv) => (
                <li
                  key={inv.event_id}
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    setSelectedEvent({ eventId: inv.event_id, groupId })
                  }
                >
                  {inv.events?.name} –{" "}
                  {inv.events?.start_time
                    ? new Date(inv.events.start_time).toLocaleString()
                    : "Unbekanntes Datum"}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Event-Popup */}
      {selectedEvent && (
        <EventDetailsPopup
          eventId={selectedEvent.eventId}
          groupId={selectedEvent.groupId}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
