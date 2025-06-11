export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_chats: {
        Row: {
          content: string
          created_at: string | null
          event_id: string
          group_id: string | null
          id: string
          sender_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          event_id: string
          group_id?: string | null
          id?: string
          sender_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          event_id?: string
          group_id?: string | null
          id?: string
          sender_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_chats_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_chats_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_chats_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          event_id: string | null
          group_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["invitation_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          event_id?: string | null
          group_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          event_id?: string | null
          group_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          creator_id: string
          deleted_at: string | null
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          max_attendees: number | null
          name: string
          public: boolean
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          creator_id: string
          deleted_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          max_attendees?: number | null
          name: string
          public?: boolean
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          creator_id?: string
          deleted_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          max_attendees?: number | null
          name?: string
          public?: boolean
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_foreign"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_group_invitation_statuses: {
        Row: {
          description: string | null
          id: string
          importance: number
          is_final: boolean
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          importance?: number
          is_final?: boolean
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          importance?: number
          is_final?: boolean
          name?: string
        }
        Relationships: []
      }
      friend_group_invites: {
        Row: {
          created_at: string
          expires_at: string | null
          group_id: string
          id: string
          invited_user_id: string
          inviter_id: string
          message: string | null
          responded_at: string | null
          status_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          group_id: string
          id?: string
          invited_user_id: string
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          status_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          group_id?: string
          id?: string
          invited_user_id?: string
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          status_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_group_invites_group_id_foreign"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_group_invites_status_id_foreign"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "friend_group_invitation_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_group_members_group_id_foreign"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_groups: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          city: string
          country: string
          created_at: string
          creator_id: string
          house_number: string
          id: string
          latitude: number | null
          longitude: number | null
          postal_code: string
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          creator_id: string
          house_number: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          postal_code: string
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          creator_id?: string
          house_number?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          postal_code?: string
          street?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_status: "draft" | "published" | "cancelled" | "completed"
      invitation_method: "direct" | "group"
      invitation_status:
        | "pending"
        | "accepted"
        | "declined"
        | "maybe"
        | "expired"
      privacy_level: "public" | "friends_only" | "private" | "invite_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_status: ["draft", "published", "cancelled", "completed"],
      invitation_method: ["direct", "group"],
      invitation_status: [
        "pending",
        "accepted",
        "declined",
        "maybe",
        "expired",
      ],
      privacy_level: ["public", "friends_only", "private", "invite_only"],
    },
  },
} as const
