import {Database} from "@/types/supabase";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export type EventWithVenue = Database["public"]["Tables"]["events"]["Row"] & {
    venues: Database["public"]["Tables"]["venues"]["Row"] | null
}
export type FirendGroup = Database["public"]["Tables"]["friend_groups"]["Row"];
export type FirendGroupMembers = Database["public"]["Tables"]["friend_group_members"]["Row"];
export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
export type FriendGroupInsert = Database["public"]["Tables"]["friend_groups"]["Insert"];
export type EventInvitation = Database["public"]["Tables"]["event_invitations"]["Row"];
export type FriendGroupInvitationsInsert = Database["public"]["Tables"]["friend_group_invites"]["Insert"];
export type MessageRow = Database["public"]["Tables"]["event_chats"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
