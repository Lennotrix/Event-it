import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface InviteInfo {
  status: string
  notes: string | null
  accepted_at: string | null
}

export default function EventDetailsPopup({
  eventId,
  groupId,
  onClose,
}: {
  eventId: string
  groupId?: string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [eventInfo, setEventInfo] = useState<{
    name: string;
    image_url: string | null;
    start_time: string;
    end_time: string;
    venue: {
      street: string;
      house_number: string;
      postal_code: string;
      city: string;
    } | null;
  } | null>(null)
  const [profiles, setProfiles] = useState<Record<string, { username: string; avatar_url: string | null }>>({})
  const [inviteData, setInviteData] = useState<Record<string, InviteInfo>>({})
  const [counts, setCounts] = useState({ accepted: 0, maybe: 0, declined: 0 })
  const { toast } = useToast()

  const priority: Record<string, number> = { accepted: 3, maybe: 2, declined: 1 }

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      try {
        // Load event
        const { data: ev } = await supabase
          .from('events')
          .select('name, image_url, start_time, end_time, venue:venues(street, house_number, postal_code, city)')
          .eq('id', eventId)
          .single()
        if (ev) setEventInfo(ev as any)

        // Load invitations
        let q = supabase
          .from('event_invitations')
          .select('user_id, status, notes, accepted_at')
          .eq('event_id', eventId)
          .in('status', ['accepted', 'maybe', 'declined'])
        if (groupId) q = q.eq('group_id', groupId)
        const { data: invs = [], error } = await q
        if (error) throw error

        // Deduplicate per user
        const dedup: Record<string, InviteInfo> = {}
        invs?.forEach(inv => {
          const uid = inv.user_id!
          const st = inv.status!
          if (!dedup[uid] || priority[st] > priority[dedup[uid].status]) {
            dedup[uid] = { status: st, notes: inv.notes, accepted_at: inv.accepted_at }
          }
        })
        setInviteData(dedup)

        // Counts
        const vals = Object.values(dedup)
        setCounts({
          accepted: vals.filter(i => i.status === 'accepted').length,
          maybe: vals.filter(i => i.status === 'maybe').length,
          declined: vals.filter(i => i.status === 'declined').length,
        })

        // Load profiles
        const ids = Object.keys(dedup)
        if (ids.length) {
          const { data: profs = [] } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', ids)
          const pm: typeof profiles = {}
          profs?.forEach(p => { pm[p.id] = { username: p.username, avatar_url: p.avatar_url } })
          setProfiles(pm)
        }
      } catch (err) {
        console.error(err)
        toast({ title: 'Fehler', description: 'Konnte Daten nicht laden.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId, groupId])

  if (loading) return <div className="text-center p-8">Lade Daten...</div>

  // Calculate bar width relative to highest vote count
  const maxCount = Math.max(counts.accepted, counts.maybe, counts.declined, 1)
  const barMaxWidth = 200
  const calcWidth = (n: number) => (n / maxCount) * barMaxWidth

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl w-[70vw] h-[70vh] flex overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >✕</Button>

        {/* Status Bars */}
        <div className="w-1/3 border-r flex flex-col">
          {eventInfo && (
            <div className="p-4 border-b flex items-center space-x-4">
              {eventInfo.image_url && (
                <img src={eventInfo.image_url} alt={eventInfo.name} className="w-20 h-20 rounded-md object-cover" />
              )}
              <div>
                <h2 className="text-xl font-semibold">{eventInfo.name}</h2>
                <p className="text-xs text-gray-600">
                  {new Date(eventInfo.start_time).toLocaleDateString()} – {new Date(eventInfo.start_time).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
          <div className="flex-1 p-4 flex flex-col justify-start space-y-4">
            {(['accepted','maybe','declined'] as const).map(st => {
              const col = {
                accepted: { bg: 'bg-green-100', fill: 'bg-green-500', tick: 'bg-green-700' },
                maybe:   { bg: 'bg-yellow-100', fill: 'bg-yellow-500', tick: 'bg-yellow-700' },
                declined:{ bg: 'bg-red-100', fill: 'bg-red-500', tick: 'bg-red-700' },
              }[st]
              const cnt = counts[st]
              return (
                <div key={st}>
                  <div
                    className={`h-12 rounded-full relative overflow-hidden ${col.bg}`}
                    style={{ width: `${barMaxWidth}px` }}
                  >  
                    <div
                      className={`${col.fill} h-full rounded-full`} 
                      style={{ width: `${calcWidth(cnt)}px` }}
                    />
                    {Array.from({ length: cnt }).map((_, i) => (
                      <div
                        key={i}
                        className={`${col.tick} absolute w-0.5 h-full`} 
                        style={{ left: `${((i+1)/(cnt+1))*100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 capitalize">{st}: {cnt}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Participants */}
        <div className="w-1/3 p-6 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-center">Teilnehmerübersicht</h2>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {Object.entries(inviteData).map(([uid, info]) => {
              const prof = profiles[uid]
              const colorClass = info.status === 'accepted'
                ? 'text-green-600' : info.status === 'maybe'
                ? 'text-yellow-600' : 'text-red-600'
              return (
                <div key={uid} className="flex items-center p-3 border rounded-lg space-x-3">
                  <Avatar className="w-8 h-8">
                    {prof?.avatar_url
                      ? <AvatarImage src={prof.avatar_url} alt={prof.username ?? 'Avatar'} className="w-full h-full object-cover" />
                      : <AvatarFallback>{prof?.username?.[0] ?? '?'}</AvatarFallback>
                    }
                  </Avatar>
                  <div>
                    <p className={`font-medium ${colorClass}`}>{prof?.username ?? 'Unbekannt'}</p>
                    {info.accepted_at && (
                      <p className="text-xs text-gray-500">Akzeptiert am {new Date(info.accepted_at).toLocaleString()}</p>
                    )}
                    {info.notes && <p className="text-sm text-gray-500">Notiz: {info.notes}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="w-1/3 border-l p-4 bg-gray-50 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>
          <div className="text-center text-gray-500 mt-auto mb-auto">Chat-Funktion bald verfügbar</div>
        </div>
      </div>
    </div>
  )
}
