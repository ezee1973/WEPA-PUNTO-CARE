export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          gig_id: string
          id: string
          nurse_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          gig_id: string
          id?: string
          nurse_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          gig_id?: string
          id?: string
          nurse_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_offers: {
        Row: {
          added_by: string
          created_at: string
          gig_id: string
          offer_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          gig_id: string
          offer_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          gig_id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_offers_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "tourism_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          city: string
          created_at: string
          description: string
          duration_weeks: number
          hospital_id: string
          id: string
          owner_id: string
          shift: string
          specialty: string
          start_date: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          weekly_pay: number
        }
        Insert: {
          city: string
          created_at?: string
          description?: string
          duration_weeks?: number
          hospital_id: string
          id?: string
          owner_id: string
          shift: string
          specialty: string
          start_date: string
          status?: Database["public"]["Enums"]["gig_status"]
          title: string
          weekly_pay: number
        }
        Update: {
          city?: string
          created_at?: string
          description?: string
          duration_weeks?: number
          hospital_id?: string
          id?: string
          owner_id?: string
          shift?: string
          specialty?: string
          start_date?: string
          status?: Database["public"]["Enums"]["gig_status"]
          title?: string
          weekly_pay?: number
        }
        Relationships: [
          {
            foreignKeyName: "gigs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          city: string
          created_at: string
          description: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          city: string
          created_at?: string
          description?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          city?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          home_state: string | null
          id: string
          organization_name: string | null
          role: Database["public"]["Enums"]["account_role"]
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          home_state?: string | null
          id: string
          organization_name?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          home_state?: string | null
          id?: string
          organization_name?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qualification_steps: {
        Row: {
          id: string
          nurse_id: string
          response: Json
          status: string
          step_key: string
          title: string
          updated_at: string
        }
        Insert: {
          id?: string
          nurse_id: string
          response?: Json
          status?: string
          step_key: string
          title: string
          updated_at?: string
        }
        Update: {
          id?: string
          nurse_id?: string
          response?: Json
          status?: string
          step_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tourism_offers: {
        Row: {
          active: boolean
          capacity: number
          category: string
          created_at: string
          description: string
          hospital_price: number
          id: string
          location: string
          owner_id: string
          partner_name: string
          retail_value: number
          title: string
        }
        Insert: {
          active?: boolean
          capacity?: number
          category: string
          created_at?: string
          description?: string
          hospital_price?: number
          id?: string
          location: string
          owner_id: string
          partner_name: string
          retail_value?: number
          title: string
        }
        Update: {
          active?: boolean
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          hospital_price?: number
          id?: string
          location?: string
          owner_id?: string
          partner_name?: string
          retail_value?: number
          title?: string
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
      account_role: "nurse" | "hospital" | "tourism"
      application_status:
        | "applied"
        | "reviewing"
        | "qualified"
        | "interview"
        | "offered"
        | "accepted"
      gig_status: "draft" | "published" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_role: ["nurse", "hospital", "tourism"],
      application_status: [
        "applied",
        "reviewing",
        "qualified",
        "interview",
        "offered",
        "accepted",
      ],
      gig_status: ["draft", "published", "closed"],
    },
  },
} as const
