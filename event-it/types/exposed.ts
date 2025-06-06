import {Database} from "@/types/supabase";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type FirendGroup = Database["public"]["Tables"]["friend_groups"]["Row"];
export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
export type FriendGroupInsert = Database["public"]["Tables"]["friend_groups"]["Insert"];
export type FriendGroupInvitationsInsert = Database["public"]["Tables"]["friend_group_invites"]["Insert"];