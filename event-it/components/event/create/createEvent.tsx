'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@radix-ui/react-menu";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Database} from "@/types/supabase";
import {usePopup} from "@/components/provider/popupProvider";
import PublishEventConfirm from "@/components/event/create/publishEventConfirm";

const eventStatusEnum = z.enum(['draft', 'published', 'cancelled', 'completed']); // Adjust values as needed

const formSchema = z.object({
    name: z.string().min(3, "Name muss minimum 3 Zeichen lang sein"),
    description: z.string().nullable().optional(),
    start_time: z.string().min(1, "Startzeit ist erforderlich"),
    end_time: z.string().min(1, "Endzeit ist erforderlich"),
    venue_id: z.string().nullable().optional(),
    artist_id: z.string().nullable().optional(), // ✅ new
    image_url: z.string().nullable().optional(),
    max_attendees: z.number().positive("Muss eine positive Zahl sein").nullable().optional(),
    status: eventStatusEnum.optional(),
    public: z.boolean(),
})

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

type FormData = z.infer<typeof formSchema>

export default function CreateEventForm() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: 'draft',
            public: false
        }
    })

    const [venues, setVenues] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const [artists, setArtists] = useState<any[]>([])
    const {openPopup, closePopup} = usePopup()

    useEffect(() => {
        const fetchArtists = async () => {
            const supabase = createClient()
            const { data: artistData, error } = await supabase
                .from('artists')
                .select('id, stage_name')

            if (error) {
                console.error('Error fetching artists:', error)
            } else {
                setArtists(artistData || [])
            }
        }

        fetchArtists()
    }, [])

    useEffect(() => {
        const fetchVenues = async () => {
            const supabase = createClient();
            const { data: venuesData, error } = await supabase.from('venues').select('id, name')
            if (error) {
                console.error('Error fetching venues:', error)
            } else {
                setVenues(venuesData || [])
            }
        }
        fetchVenues()
    }, [])

    const onSubmit = async (data: FormData) => {
        console.log('Form data before submission:', data)
        setIsSubmitting(true)
        const supabase = createClient();

        try {
            console.log('Submitting event data:', data)
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user || !user.id) {
                return
            }

            // Prepare the insert data according to your database schema
            const insertData: EventInsert = {
                name: data.name,
                description: data.description || null,
                start_time: data.start_time,
                end_time: data.end_time,
                venue_id: data.venue_id || null,
                image_url: data.image_url || null,
                max_attendees: data.max_attendees || null,
                status: 'draft',
                creator_id: user.id,
                public: data.public,
            }

            const { error } = await supabase.from('events').insert(insertData)

            if (error) {
                alert('Error creating event: ' + error.message)
            } else {
                const {error, data: event} = await supabase.from("events").select("id").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(1).single();

                if(error || !event || !event.id) {
                    console.error('Error fetching created event:', error);
                    return;
                }

                openPopup(<PublishEventConfirm eventId={event.id} closeAction={() => {
                    closePopup();
                    router.push(`/events`);
                }} />)
            }
        } catch (error) {
            console.error('Error creating event:', error)
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
                        <Label>Ort (optional)</Label>
                        <Select onValueChange={(val) => setValue('venue_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a venue"/>
                            </SelectTrigger>
                            <SelectContent>
                                {venues.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.venue_id && <p className="text-red-500 text-sm">{errors.venue_id.message}</p>}
                    </div>

                    <div>
                        <Label>Artist (optional)</Label>
                        <Select onValueChange={(val) => setValue('artist_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an artist"/>
                            </SelectTrigger>
                            <SelectContent>
                                {artists.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.stage_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.artist_id && <p className="text-red-500 text-sm">{errors.artist_id.message}</p>}
                    </div>

                    <div>
                        <Label>Max Besucher (optional)</Label>
                        <Input
                            type="number"
                            {...register('max_attendees', {
                                valueAsNumber: true,
                                setValueAs: (v) => v === '' ? null : Number(v)
                            })}
                            placeholder="Enter maximum number of attendees"
                        />
                        {errors.max_attendees && <p className="text-red-500 text-sm">{errors.max_attendees.message}</p>}
                    </div>

                    <div>
                        <Label>Bild URL (optional)</Label>
                        <Input {...register('image_url')} placeholder="Enter image URL"/>
                        {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
                    </div>

                    <div>
                        <Label>Öffentlich?</Label>
                        <Switch {...register('public')}/>
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Event...' : 'Create Event'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}