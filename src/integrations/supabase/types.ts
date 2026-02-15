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
      clips: {
        Row: {
          clip_title: string
          created_at: string
          end_seconds: number
          id: string
          notes: string | null
          start_seconds: number
          tags: string[] | null
          video_id: string
        }
        Insert: {
          clip_title: string
          created_at?: string
          end_seconds: number
          id?: string
          notes?: string | null
          start_seconds: number
          tags?: string[] | null
          video_id: string
        }
        Update: {
          clip_title?: string
          created_at?: string
          end_seconds?: number
          id?: string
          notes?: string | null
          start_seconds?: number
          tags?: string[] | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clips_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          play_id: string
          rule_reference: string | null
          score: number
          timestamp_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          play_id: string
          rule_reference?: string | null
          score?: number
          timestamp_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          play_id?: string
          rule_reference?: string | null
          score?: number
          timestamp_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_filters: {
        Row: {
          created_at: string
          filter_type: string
          id: string
          is_active: boolean
          keywords: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          filter_type: string
          id?: string
          is_active?: boolean
          keywords: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          filter_type?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      flagged_moments: {
        Row: {
          bucket_count: number
          content_verified: boolean | null
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
          verification_reason: string | null
        }
        Insert: {
          bucket_count?: number
          content_verified?: boolean | null
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
          verification_reason?: string | null
        }
        Update: {
          bucket_count?: number
          content_verified?: boolean | null
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
          verification_reason?: string | null
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
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          created_at: string
          example_play_ids: string[]
          id: string
          league: string
          official_text: string
          plain_english_summary: string
          rule_id: string
          rule_number: string
          season: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          example_play_ids?: string[]
          id?: string
          league: string
          official_text: string
          plain_english_summary: string
          rule_id: string
          rule_number: string
          season?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          example_play_ids?: string[]
          id?: string
          league?: string
          official_text?: string
          plain_english_summary?: string
          rule_id?: string
          rule_number?: string
          season?: string | null
          tags?: string[]
          title?: string
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          id: string
          title: string | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
      detection_status: ["flagged", "reviewing", "confirmed", "dismissed"],
      platform_source: ["x", "reddit", "youtube", "tiktok", "instagram"],
    },
  },
} as const
