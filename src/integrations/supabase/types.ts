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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      flagged_moments: {
        Row: {
          bucket_count: number
          created_at: string
          detected_at: string
          emotion_keywords: string[]
          engagement_velocity_score: number
          game_id: string | null
          game_timestamp: string | null
          id: string
          league: string | null
          officiating_keywords: string[]
          platform: Database["public"]["Enums"]["platform_source"]
          players: string[] | null
          post_volume: number
          reviewed_at: string | null
          reviewed_by: string | null
          rule_keywords: string[]
          source_text: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["detection_status"]
          teams: string[]
          updated_at: string
        }
        Insert: {
          bucket_count?: number
          created_at?: string
          detected_at?: string
          emotion_keywords?: string[]
          engagement_velocity_score?: number
          game_id?: string | null
          game_timestamp?: string | null
          id?: string
          league?: string | null
          officiating_keywords?: string[]
          platform: Database["public"]["Enums"]["platform_source"]
          players?: string[] | null
          post_volume?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_keywords?: string[]
          source_text?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["detection_status"]
          teams: string[]
          updated_at?: string
        }
        Update: {
          bucket_count?: number
          created_at?: string
          detected_at?: string
          emotion_keywords?: string[]
          engagement_velocity_score?: number
          game_id?: string | null
          game_timestamp?: string | null
          id?: string
          league?: string | null
          officiating_keywords?: string[]
          platform?: Database["public"]["Enums"]["platform_source"]
          players?: string[] | null
          post_volume?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_keywords?: string[]
          source_text?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["detection_status"]
          teams?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      keyword_buckets: {
        Row: {
          bucket_name: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[]
          league: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords: string[]
          league?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          league?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          author: string | null
          created_at: string
          detected_keywords: string[]
          engagement_count: number | null
          flagged_moment_id: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_source"]
          post_id: string | null
          post_text: string
          post_url: string | null
          posted_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          detected_keywords?: string[]
          engagement_count?: number | null
          flagged_moment_id?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_source"]
          post_id?: string | null
          post_text: string
          post_url?: string | null
          posted_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          detected_keywords?: string[]
          engagement_count?: number | null
          flagged_moment_id?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_source"]
          post_id?: string | null
          post_text?: string
          post_url?: string | null
          posted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_flagged_moment_id_fkey"
            columns: ["flagged_moment_id"]
            isOneToOne: false
            referencedRelation: "flagged_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      team_mappings: {
        Row: {
          aliases: string[]
          created_at: string
          id: string
          is_active: boolean
          league: string
          team_name: string
        }
        Insert: {
          aliases: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          league: string
          team_name: string
        }
        Update: {
          aliases?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          league?: string
          team_name?: string
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
      detection_status: "flagged" | "reviewing" | "confirmed" | "dismissed"
      platform_source: "x" | "reddit" | "youtube" | "tiktok" | "instagram"
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
    Enums: {
      detection_status: ["flagged", "reviewing", "confirmed", "dismissed"],
      platform_source: ["x", "reddit", "youtube", "tiktok", "instagram"],
    },
  },
} as const
