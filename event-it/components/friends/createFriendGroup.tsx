'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {Card, CardContent} from "@/components/ui/card";
import {createClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {FriendGroupInsert} from "@/types/exposed";
import {toast} from "sonner";

const groupSchema = z.object({
    name: z.string().min(3, 'Name muss minimum 3 Zeichen lang sein'),
    description: z.string().nullable().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>

export default function CreateGroup() {
    const { register, handleSubmit, formState: { errors } } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema)
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const onSubmit = async (data: GroupFormData) => {
        setIsSubmitting(true)
        const supabase = createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            alert('Fehler beim Abrufen des Benutzers.')
            setIsSubmitting(false)
            return
        }

        const insertData: FriendGroupInsert = {
            name: data.name,
            description: data.description || null,
            owner_id: user.id,
            is_active: true
        }

        const { error, data: group } = await supabase.from('friend_groups').insert(insertData).select().single()

        if (error) {
            toast.error('Fehler beim Erstellen der Gruppe: ' + error.message)
        } else {
            const { error: memberError } = await supabase
                .from("friend_group_members")
                .insert({group_id: group.id, user_id: user.id})

            if (memberError) {
                toast.error('Fehler beim Hinzufügen des Benutzers zur Gruppe: ' + memberError.message);
                return;
            }

            toast.success('Gruppe erfolgreich erstellt!')
            router.push(`/friends/groups/${group.id}`)
        }

        setIsSubmitting(false)
    }

    return (
        <Card className="max-w-md w-full p-6">
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Gruppenname</Label>
                        <Input {...register('name')} placeholder="z. B. Feierabendrunde" />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea {...register('description')} placeholder="Worum geht es in dieser Gruppe?" />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Gruppe wird erstellt...' : 'Gruppe erstellen'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
