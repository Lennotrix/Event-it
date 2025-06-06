'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import EventDetailsPopup from '@/components/EventDetailsPopup'

type Event = {
  id: string
  name: string
  start_time: string
  end_time: string
  image_url?: string | null
}


export default function EigeneEvents() {

 const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)


  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user?.id) {
        toast({
          title: "Fehler",
          description: "Benutzer nicht authentifiziert.",
          variant: "destructive"
        })
        return
      }

      const { data, error } = await supabase
        .from("events")
        .select("id, name, start_time, end_time, image_url")
        .eq("creator_id", user.id)
        .order("start_time", { ascending: true })

      if (error) {
        toast({
          title: "Fehler",
          description: "Events konnten nicht geladen werden.",
          variant: "destructive"
        })
      } else {
        setEvents(data || [])
      }

      setLoading(false)
    }

    fetchEvents().catch(console.error)
  }, [])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      toast({
        title: "Fehler",
        description: "Event konnte nicht gelöscht werden.",
        variant: "destructive"
      })
    } else {
      setEvents((prev) => prev.filter(e => e.id !== id))
      toast({
        title: "Erfolg",
        description: "Event gelöscht.",
        variant: "default"
      })
    }
  }

  
  return (
    <main className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🗓️ Eigene Events</h1>
        <Link href="/events/create">
          <Button>➕ Neues Event erstellen</Button>
        </Link>
      </div>

      {loading ? (
        <p>Lade Events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">Keine Events gefunden.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border p-4 rounded shadow hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => setSelectedEventId(event.id)}
            >
              <div>
                <Label className="font-semibold">{event.name}</Label>
                {event.image_url && (
                  <img src={event.image_url} alt={event.name} className="h-20 w-20 object-cover mt-2" />
                )}
                <div className="text-sm text-gray-500">
                  {new Date(event.start_time).toLocaleString("de-DE")} –{" "}
                  {new Date(event.end_time).toLocaleString("de-DE")}
                </div>
              </div>
              <div className="flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                <Link href={`/events/edit/${event.id}`}>
                  <Button variant="outline">Bearbeiten</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDelete(event.id)}>Löschen</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup anzeigen */}
      {selectedEventId && (
        <EventDetailsPopup
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </main>
  )
}
