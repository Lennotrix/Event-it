'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// Event includes venue and attendances
// Venue has no "name" field; fallback to city/street

type RawEvent = Database['public']['Tables']['events']['Row'] & {
  venue: Database['public']['Tables']['venues']['Row'] | null
  attendances: Database['public']['Tables']['event_attendances']['Row'][]
}

type ProfileMap = Record<string, { username: string; avatar_url: string | null }>

export default function EventDetailsPopup({
  eventId,
  onClose,
}: {
  eventId: string
  onClose: () => void
}) {
  const [event, setEvent] = useState<RawEvent | null>(null)
  const [profiles, setProfiles] = useState<ProfileMap>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()

    const fetchEventDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            venue:venues(*),
            attendances:event_attendances(registered_at, user_id, notes)
          `)
          .eq('id', eventId)
          .single()

        if (error) throw error
        if (!data) throw new Error('No data received')

        setEvent(data as RawEvent)

        const userIds = data.attendances.map(a => a.user_id)
        const uniqueIds = Array.from(new Set(userIds))

        if (uniqueIds.length === 0) return

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', uniqueIds)

        if (profileError) throw profileError

        const profileMap: ProfileMap = {}
        for (const profile of profileData || []) {
          profileMap[profile.id] = {
            username: profile.username,
            avatar_url: profile.avatar_url,
          }
        }

        setProfiles(profileMap)
      } catch (error) {
        console.error('Fehler beim Laden:', error)
        toast({
          title: 'Fehler',
          description: 'Eventdetails konnten nicht geladen werden.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  if (loading) return <div className="text-center p-8">Lade Event...</div>
  if (!event) return <div className="text-center p-8">Event nicht gefunden.</div>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[70vw] h-[70vh] flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              ✕
            </Button>
          </div>

          {event.image_url && (
            <div className="mb-6">
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Start</h3>
              <p>{new Date(event.start_time).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ende</h3>
              <p>{new Date(event.end_time).toLocaleString()}</p>
            </div>
            {event.venue && (
              <div>
                <h3 className="font-semibold">Ort</h3>
                <p>
                  {event.venue.street} {event.venue.house_number}, {event.venue.postal_code} {event.venue.city}
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Teilnehmer</h2>
            <div className="space-y-4">
              {event.attendances.map((a, i) => {
                const profile = profiles[a.user_id]
                return (
                  <div key={i}>
                    <p className="font-medium">
                      {profile?.username ?? 'Unbekannt'}
                    </p>
                    {a.notes && (
                      <p className="text-sm text-gray-500">Notiz: {a.notes}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Registriert am {new Date(a.registered_at).toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-1/3 border-l p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>
          <div className="text-center text-gray-500 mt-8">Chat-Funktion bald verfügbar</div>
        </div>
      </div>
    </div>
  )
}
