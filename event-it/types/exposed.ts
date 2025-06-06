import {Database} from "@/types/supabase";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export type EventWithVenue = Database["public"]["Tables"]["events"]["Row"] & {
    venues: Database["public"]["Tables"]["venues"]["Row"] | null
}