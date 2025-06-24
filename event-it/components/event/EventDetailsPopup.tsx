import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Chat from "@/components/chat/chat"
import {Input} from "@/components/ui/input";

interface InviteInfo {
  status: string
  notes: string | null
  accepted_at: string | null
}

export default function EventDetailsPopup({
  eventId,
  groupId,
  inviterId,
  onClose,
}: {
  eventId: string
  groupId?: string
    inviterId?: string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [eventInfo, setEventInfo] = useState<{
    name: string
    image_url: string | null
    start_time: string
    end_time: string
    venue: {
      street: string
      house_number: string
      postal_code: string
      city: string
    } | null
  } | null>(null)

  const [profiles, setProfiles] = useState<Record<string, { username: string; avatar_url: string | null }>>({})
  const [inviteData, setInviteData] = useState<Record<string, InviteInfo>>({})
  const [counts, setCounts] = useState({ accepted: 0, maybe: 0, declined: 0 })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")

  const priority: Record<string, number> = { accepted: 3, maybe: 2, declined: 1 }

  const loadData = async () => {
    const supabase = createClient()
    try {
      const { data: user, error: userError } = await supabase.auth.getUser()
      if (userError || !user?.user) {
        console.error("Fehler beim Laden des Benutzers:", userError)
        return
      }

      const uid = user.user.id
      setCurrentUserId(uid)

      const { data: ev } = await supabase
        .from('events')
        .select('name, image_url, start_time, end_time, venue:venues(street, house_number, postal_code, city)')
        .eq('id', eventId)
        .single()
      if (ev) setEventInfo(ev as any)

      let q = supabase
        .from('event_invitations')
        .select('user_id, status, notes, accepted_at')
        .eq('event_id', eventId)
        .in('status', ['accepted', 'maybe', 'declined'])

      if (groupId) q = q.eq('group_id', groupId)
      const { data: invs = [], error } = await q
      if (error) throw error

      const dedup: Record<string, InviteInfo> = {}
      invs?.forEach(inv => {
        const uid = inv.user_id!
        const st = inv.status!
        if (!dedup[uid] || priority[st] > priority[dedup[uid].status]) {
          dedup[uid] = { status: st, notes: inv.notes, accepted_at: inv.accepted_at }
        }
      })
      setInviteData(dedup)

      const vals = Object.values(dedup)
      setCounts({
        accepted: vals.filter(i => i.status === 'accepted').length,
        maybe: vals.filter(i => i.status === 'maybe').length,
        declined: vals.filter(i => i.status === 'declined').length,
      })

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
      toast.error('Fehler', { description: 'Konnte Daten nicht laden.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventId, groupId])

const handleStatusChange = async (newStatus: 'accepted' | 'maybe' | 'declined') => {
  if (!currentUserId) return
  const supabase = createClient()

  const query = supabase
    .from('event_invitations')
    .update({ status: newStatus, accepted_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('user_id', currentUserId)

  if(groupId) query.eq("group_id", groupId)
  else if (inviterId) query.eq("inviter_id", inviterId)
    const { error } = await query

  if (error) {
    toast.error("Status konnte nicht geändert werden.")
    return
  }

  await loadData() // 🟢 direkt neue Daten laden, ohne das Modal zu schließen
}

const handleAddNote = async () => {
    if (!currentUserId) return
    const supabase = createClient()

    const { error } = await supabase
        .from('event_invitations')
        .update({ notes: notes })
        .eq('event_id', eventId)
        .eq('user_id', currentUserId)

    if (error) {
        toast.error("Notiz konnte nicht hinzugefügt werden.")
        return
    }

    await loadData()
}

  if (loading) return <div className="text-center p-8">Lade Daten…</div>

  const maxCount = Math.max(counts.accepted, counts.maybe, counts.declined, 1)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 w-[80vw] max-w-none h-[70vh] -translate-x-1/2 -translate-y-1/2 p-0 bg-popover text-popover-foreground overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">{eventInfo?.name}</DialogTitle>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Infos + Vote */}
            <div className="w-1/3 flex flex-col h-full overflow-hidden border-r">
              {eventInfo && (
                  <div className="p-4 border-b flex items-center space-x-4">
                    {eventInfo.image_url && (
                        <img
                            src={eventInfo.image_url}
                            alt={eventInfo.name}
                            className="w-20 h-20 rounded-md object-cover"
                        />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{eventInfo.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {new Date(eventInfo.start_time).toLocaleDateString()} –{' '}
                        {new Date(eventInfo.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
              )}

              {currentUserId && (
                  <div className="p-4 border-b flex gap-2">
                    {(['accepted', 'maybe', 'declined'] as const).map((status) => (
                        <Button
                            key={status}
                            variant="outline"
                            onClick={() => handleStatusChange(status)}
                            className={inviteData[currentUserId]?.status === status ? "border-2 border-primary" : ""}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                  </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(['accepted', 'maybe', 'declined'] as const).map(status => {
                  const track = 'bg-muted'
                  const fill = status === 'accepted'
                      ? 'bg-green-500 dark:bg-green-400'
                      : status === 'maybe'
                          ? 'bg-yellow-500 dark:bg-yellow-400'
                          : 'bg-red-500 dark:bg-red-400'
                  const tick = status === 'accepted'
                      ? 'bg-green-700 dark:bg-green-600'
                      : status === 'maybe'
                          ? 'bg-yellow-700 dark:bg-yellow-600'
                          : 'bg-red-700 dark:bg-red-600'
                  const count = counts[status]
                  const widthPct = (count / maxCount) * 100
                  return (
                      <div key={status}>
                        <div className={`h-12 w-full rounded-full relative overflow-hidden ${track}`}>
                          <div className={`${fill} h-full rounded-full`} style={{width: `${widthPct}%`}}/>
                          {Array.from({length: count}).map((_, i) => (
                              <div
                                  key={i}
                                  className={`${tick} absolute w-0.5 h-full`}
                                  style={{left: `${((i + 1) / (count + 1)) * 100}%`}}
                              />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                          {status}: {count}
                        </p>
                      </div>
                  )
                })}
              </div>
              <div className="mt-auto p-4 border-t flex items-center justify-between gap-2">
                <Input
                    placeholder="Notiz"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={() => handleAddNote()}>Hinzufügen</Button>
              </div>
            </div>

            {/* Mitte: Teilnehmerliste */}
            <div className="w-1/3 flex flex-col h-full overflow-hidden border-r">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-center text-foreground">Teilnehmerübersicht</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(inviteData).map(([uid, info]) => {
                  const prof = profiles[uid]
                  const nameCls = info.status === 'accepted'
                    ? 'text-green-600 dark:text-green-400'
                    : info.status === 'maybe'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  return (
                    <div key={uid} className="flex items-center p-3 border rounded-lg space-x-3">
                      <Avatar className="w-8 h-8">
                        {prof?.avatar_url ? (
                          <AvatarImage
                            src={prof.avatar_url}
                            alt={prof.username ?? 'Avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AvatarFallback>{prof?.username?.[0] ?? '?'}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className={`font-medium ${nameCls}`}>{prof?.username ?? 'Unbekannt'}</p>
                        {info.accepted_at && (
                          <p className="text-xs text-muted-foreground">
                            Akzeptiert am {new Date(info.accepted_at).toLocaleString()}
                          </p>
                        )}
                        {info.notes && (
                          <p className="text-sm text-muted-foreground">Notiz: {info.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rechts: Chat */}
            <div className="w-1/3 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-foreground">Chat</h2>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                {groupId && <Chat eventId={eventId} groupId={groupId} />}
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
