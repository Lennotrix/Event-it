import {Database} from "@/types/supabase";

export type Event = Database["public"]["Tables"]["events"]["Row"];