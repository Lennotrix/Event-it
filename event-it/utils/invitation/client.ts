import {createClient} from "@/utils/supabase/client";

async function updateInvitationStatus(eventId: string, userId: string, status: 'accepted' | 'declined' | 'pending') {
    const supabase = createClient();
    const { error } = await supabase
        .from('event_invitations')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', userId)

    if (error) {
        console.error(`Error updating invitation status to ${status}:`, error)
        return error
    }
}

export async function Accept(eventId: string, userId: string) {
    return updateInvitationStatus(eventId, userId, 'accepted')
}

export async function Decline(eventId: string, userId: string) {
    return updateInvitationStatus(eventId, userId, 'declined')
}