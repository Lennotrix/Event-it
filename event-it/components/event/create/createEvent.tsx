'use client'

import {Controller, useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@radix-ui/react-menu";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Database} from "@/types/supabase";
import {usePopup} from "@/components/provider/popupProvider";
import PublishEventConfirm from "@/components/event/create/publishEventConfirm";
import { useParams } from 'next/navigation'

const eventStatusEnum = z.enum(['draft', 'published', 'cancelled', 'completed']); // Adjust values as needed

const formSchema = z.object({
    name: z.string().min(3, "Name muss minimum 3 Zeichen lang sein"),
    description: z.string().nullable().optional(),
    start_time: z.string().min(1, "Startzeit ist erforderlich"),
    end_time: z.string().min(1, "Endzeit ist erforderlich"),
    country: z.string().min(3, "Land muss minimum 3 Zeichen lang sein"),
    city: z.string().min(3, "Stadt muss minimum 3 Zeichen lang sein"),
    postal_code: z.string().min(4, "PLZ muss minimum 4 Zeichen lang sein"),
    street: z.string().min(3, "Straße muss minimum 3 Zeichen lang sein"),
    house_number: z.string().min(1, "Hausnummer ist erforderlich"),
    venue_id: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    max_attendees: z.number().positive("Muss eine positive Zahl sein").nullable().optional(),
    status: eventStatusEnum.optional(),
    public: z.boolean(),
})

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];

type FormData = z.infer<typeof formSchema>

export default function CreateEventForm() {
    const { control,register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: 'draft',
            public: false
        }
    })

    const params = useParams()
    const eventId = params?.eventid as string

    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const [artists, setArtists] = useState<any[]>([])
    const {openPopup, closePopup} = usePopup()

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return
            const supabase = createClient()

            const { data: event, error:eventerror } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single()
            if (eventerror) {
                console.error('Fehler beim Laden des Events:', eventerror)
                return
            }

            if (!(event && typeof event.venue_id === 'string')) {
                return
            }
            const { data: venuesData, error: venueerror } = await supabase
                .from('venues')
                .select('*')
                .eq('id', event.venue_id)
                .single()

            if (venueerror) {
                console.error('Error fetching venues:', venueerror)
                return
            }

            console.log(event)
            const formattedstarttime = new Date(event.start_time)
                .toISOString()
                .slice(0, 16)

            const formattedendtime = new Date(event.end_time)
                .toISOString()
                .slice(0, 16)

            setValue('name', event.name)
            setValue('description', event.description)
            setValue('start_time', formattedstarttime)
            setValue('end_time', formattedendtime)
            setValue('venue_id', event.venue_id)
            setValue('image_url', event.image_url)
            setValue('max_attendees', event.max_attendees)
            setValue('public', Boolean(event.public))
            setValue('country', venuesData.country)
            setValue('city', venuesData.city)
            setValue('postal_code', venuesData.postal_code)
            setValue('street', venuesData.street)
            setValue('house_number', venuesData.house_number)
            //console.log(Boolean(event.public))
        }
        fetchEvent()
    }, [eventId])

    const handleCreateEvent = async (formData: FormData) => {
        const supabase = createClient()

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user || !user.id) {
                throw new Error('User authentication failed')
            }

            // Create venue first
            const venueInsertData: VenueInsert = {
                creator_id: user.id,
                country: formData.country,
                city: formData.city,
                postal_code: formData.postal_code,
                street: formData.street,
                house_number: formData.house_number,
            }

            const { data: venue, error: venueError } = await supabase
                .from('venues')
                .insert(venueInsertData)
                .select("*")
                .single()

            if (venueError) {
                throw new Error('Error creating venue: ' + venueError.message)
            }

            // Create event with the new venue
            const eventInsertData: EventInsert = {
                name: formData.name,
                description: formData.description || null,
                start_time: formData.start_time,
                end_time: formData.end_time,
                venue_id: venue.id,
                image_url: formData.image_url || null,
                max_attendees: formData.max_attendees || null,
                status: 'draft',
                creator_id: user.id,
                public: formData.public,
            }

            const { error: eventError } = await supabase
                .from('events')
                .insert(eventInsertData)

            if (eventError) {
                throw new Error('Error creating event: ' + eventError.message)
            }

            // Get the created event for popup
            const { error: fetchError, data: createdEvent } = await supabase
                .from("events")
                .select("id")
                .eq("creator_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

            if (fetchError || !createdEvent || !createdEvent.id) {
                throw new Error('Error fetching created event')
            }

            openPopup(
                <PublishEventConfirm
                    eventId={createdEvent.id}
                    closeAction={() => {
                        closePopup();
                        router.push(`/events`);
                    }}
                />,
                "Event veröffentlichen?",
                "Bitte überprüfe die Details deines Events, bevor du es veröffentlichst."
            )

        } catch (error) {
            console.error('Error in handleCreateEvent:', error)
            alert(error instanceof Error ? error.message : 'An error occurred')
        }
    }

    const handleUpdateEvent = async (formData: FormData) => {
        const supabase = createClient()

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user || !user.id) {
                throw new Error('User authentication failed')
            }

            // Get existing event
            const { data: existingEvent, error: eventFetchError } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single()

            if (eventFetchError || !existingEvent) {
                throw new Error('Error fetching existing event: ' + eventFetchError?.message)
            }

            // Update venue
            const venueUpdateData: VenueUpdate = {
                creator_id: user.id,
                country: formData.country,
                city: formData.city,
                postal_code: formData.postal_code,
                street: formData.street,
                house_number: formData.house_number,
            }

            const { data: updatedVenue, error: venueError } = await supabase
                .from('venues')
                .update(venueUpdateData)
                .eq("id", existingEvent.venue_id!)
                .select("*")
                .single()

            if (venueError) {
                throw new Error('Error updating venue: ' + venueError.message)
            }

            // Update event
            const eventUpdateData: EventInsert = {
                name: formData.name,
                description: formData.description || null,
                start_time: formData.start_time,
                end_time: formData.end_time,
                venue_id: updatedVenue.id,
                image_url: formData.image_url || null,
                max_attendees: formData.max_attendees || null,
                status: 'draft',
                creator_id: user.id,
                public: formData.public,
            }

            const { error: eventError } = await supabase
                .from('events')
                .update(eventUpdateData)
                .eq('id', eventId)

            if (eventError) {
                throw new Error('Error updating event: ' + eventError.message)
            }

            openPopup(
                <PublishEventConfirm
                    eventId={eventId}
                    closeAction={() => {
                        closePopup();
                        router.push(`/events`);
                    }}
                />,
                "Event veröffentlichen?",
                "Bitte überprüfe die Details deines Events, bevor du es veröffentlichst."
            )

        } catch (error) {
            console.error('Error in handleUpdateEvent:', error)
            alert(error instanceof Error ? error.message : 'An error occurred')
        }
    }

    const onSubmit = async (formData: FormData) => {
        setIsSubmitting(true)

        try {
            if (eventId) {
                await handleUpdateEvent(formData)
            } else {
                await handleCreateEvent(formData)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl w-full p-6">
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Event Name</Label>
                        <Input {...register('name')} placeholder="Mein Event"/>
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea {...register('description')} placeholder="Gebe eine Beschreibung an (optional)"/>
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startzeit</Label>
                            <Input type="datetime-local" {...register('start_time')} />
                            {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
                        </div>

                        <div>
                            <Label>Endzeit</Label>
                            <Input type="datetime-local" {...register('end_time')} />
                            {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time.message}</p>}
                        </div>
                    </div>

                    <div>
                        <Label>Land</Label>
                        <Input {...register('country')} placeholder="Deutschland"/>
                        {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                    </div>

                    <div>
                        <Label>Ort</Label>
                        <Input {...register('city')} placeholder="Berlin"/>
                        {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                    </div>

                    <div>
                        <Label>PLZ</Label>
                        <Input {...register('postal_code')} placeholder="10551"/>
                        {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code.message}</p>}
                    </div>

                    <div>
                        <Label>Straße</Label>
                        <Input {...register('street')} placeholder="Bundesstraße"/>
                        {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
                    </div>

                    <div>
                        <Label>Hausnummer (ggf. Zusatz)</Label>
                        <Input {...register('house_number')} placeholder="1"/>
                        {errors.house_number && <p className="text-red-500 text-sm">{errors.house_number.message}</p>}
                    </div>

                    <div>
                        <Label>Max Besucher (optional)</Label>
                        <Input
                            type="number"
                            {...register('max_attendees', {
                                valueAsNumber: true,
                                setValueAs: (v) => v === '' ? null : Number(v)
                            })}
                            placeholder="1"
                        />
                        {errors.max_attendees && <p className="text-red-500 text-sm">{errors.max_attendees.message}</p>}
                    </div>

                    <div>
                        <Label>Bild URL (optional)</Label>
                        <Input {...register('image_url')} placeholder="Bild-URL eingeben"/>
                        {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
                    </div>

                    <Controller
                        name="public"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <Label>Öffentliches Event</Label>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </div>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? (eventId ? 'Überarbeite Event...' : 'Erstelle Event...')
                            : (eventId ? 'Überarbeite Event' : 'Erstelle Event')
                        }
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}