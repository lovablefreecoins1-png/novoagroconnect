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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      anuncios: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          cidade: string | null
          created_at: string
          descricao: string | null
          estado: string | null
          fotos: string[] | null
          id: string
          lat: number | null
          lng: number | null
          preco: string | null
          titulo: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string
          descricao?: string | null
          estado?: string | null
          fotos?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          preco?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string
          descricao?: string | null
          estado?: string | null
          fotos?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          preco?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          commission_value: number | null
          contract_id: string | null
          created_at: string
          id: string
          service_value: number | null
          status: string | null
        }
        Insert: {
          commission_value?: number | null
          contract_id?: string | null
          created_at?: string
          id?: string
          service_value?: number | null
          status?: string | null
        }
        Update: {
          commission_value?: number | null
          contract_id?: string | null
          created_at?: string
          id?: string
          service_value?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          completed_at: string | null
          cost_amount: number | null
          created_at: string
          gross_amount: number | null
          id: string
          lead_id: string | null
          notes: string | null
          producer_id: string | null
          provider_id: string | null
          scheduled_date: string | null
          service_name: string | null
          service_value: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          cost_amount?: number | null
          created_at?: string
          gross_amount?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          producer_id?: string | null
          provider_id?: string | null
          scheduled_date?: string | null
          service_name?: string | null
          service_value?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          cost_amount?: number | null
          created_at?: string
          gross_amount?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          producer_id?: string | null
          provider_id?: string | null
          scheduled_date?: string | null
          service_name?: string | null
          service_value?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string
          id: string
          min_stock: number | null
          name: string
          notes: string | null
          quantity: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          min_stock?: number | null
          name: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          min_stock?: number | null
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          location_text: string | null
          message: string | null
          producer_id: string | null
          producer_name: string | null
          provider_id: string | null
          provider_name: string | null
          requested_date: string | null
          service: string | null
          status: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          location_text?: string | null
          message?: string | null
          producer_id?: string | null
          producer_name?: string | null
          provider_id?: string | null
          provider_name?: string | null
          requested_date?: string | null
          service?: string | null
          status?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          location_text?: string | null
          message?: string | null
          producer_id?: string | null
          producer_name?: string | null
          provider_id?: string | null
          provider_name?: string | null
          requested_date?: string | null
          service?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          lat: number | null
          lng: number | null
          phone: string | null
          production_types: string[] | null
          property_size: string | null
          state: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          production_types?: string[] | null
          property_size?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          production_types?: string[] | null
          property_size?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          available: string | null
          bio: string | null
          category: string | null
          created_at: string
          id: string
          photos: string[] | null
          radius_km: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          available?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          id?: string
          photos?: string[] | null
          radius_km?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          available?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          id?: string
          photos?: string[] | null
          radius_km?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
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
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
