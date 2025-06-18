"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar as BigCalendar, Views, View } from "react-big-calendar";
import { localizer } from "@/lib/calendarLocalizer";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-dark.css";
import { usePopup } from "@/components/provider/popupProvider";
import { useRouter } from "next/navigation";
import EventDetailsPopup from "@/components/event/EventDetailsPopup";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const router = useRouter();
  const { openPopup } = usePopup();
  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    groupId?: string;
    inviterId?: string;
  } | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            const supabase = createClient()
            const { data: user, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.error("Error fetching user:", userError)
                return
            }

            const { data, error } = await supabase
                .from("event_invitations")
                .select("*,events(*,venues(*))")
                .eq("user_id", user.user?.id)

            if (error) {
                console.error("Error fetching events:", error)
                return
            }

            setEvents(data)
            setLoaded(true)
        }

        fetchEvents().catch(console.error)
    }, [])
    const statusTranslations: Record<'accepted' | 'maybe' | 'pending' | 'declined', string> = {
        accepted: "Akzeptiert",
        maybe: "Vielleicht",
        pending: "Ausstehend",
        declined: "Abgelehnt",
    };
    const calendarEvents = useMemo(() => {
        return events.map((e, i) => ({
            id: `${e.event_id}-${e.group_id ?? e.inviter_id}-${e.status}-${i}`, // ensure unique
            title: `${e.events.name} (${statusTranslations[e.status as keyof typeof statusTranslations] ?? e.status})`, // optional, helps debugging
            start: new Date(e.events.start_time),
            end: new Date(e.events.end_time),
            allDay: false,
            resource: e,
            status: e.status,
        }));
    }, [events]);


    const handleSelectEvent = (event: any) => {
    const originalData = event.resource;
    setSelectedEvent({
      eventId: originalData.event_id,
      groupId: originalData.group_id,
      inviterId: originalData.inviter_id,
    });
  };

    const handleNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate)
    }, [])

    const handleViewChange = useCallback((newView: View) => {
        setCurrentView(newView)
    }, [])

  return (
    <div className="text-foreground bg-background p-2 rounded-xl shadow h-2/3 xl:h-full">
      {loaded && (
          <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={handleViewChange}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              formats={{
                  timeGutterFormat: (date, culture, localizer) =>
                      localizer!.format(date, "HH:mm", culture),
              }}
              eventPropGetter={(event) => {
                  let backgroundColor = "#3b82f6"; // default: blue

                  switch (event.status) {
                      case "accepted":
                          backgroundColor = "#10b981"; // green
                          break;
                      case "pending":
                          backgroundColor = "#f59e0b"; // amber
                          break;
                      case "maybe":
                          backgroundColor = "#f59e0b"; // amber
                          break;
                      case "declined":
                          backgroundColor = "#ef4444"; // red
                          break;
                      case "expired":
                            backgroundColor = "#6b7280"; // gray
                            break;
                  }

                  return {
                      style: {
                          backgroundColor,
                          borderRadius: "6px",
                          color: "white",
                          border: "none",
                      },
                  };
              }}
          />
        )}
      {selectedEvent && (
        <EventDetailsPopup
          eventId={selectedEvent.eventId}
          groupId={selectedEvent.groupId}
          inviterId={selectedEvent.inviterId}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}