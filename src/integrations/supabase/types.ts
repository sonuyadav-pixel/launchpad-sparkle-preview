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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      improvement_suggestions: {
        Row: {
          category: string
          created_at: string
          feedback_id: string
          id: string
          is_premium: boolean | null
          priority: number | null
          suggestion: string
        }
        Insert: {
          category: string
          created_at?: string
          feedback_id: string
          id?: string
          is_premium?: boolean | null
          priority?: number | null
          suggestion: string
        }
        Update: {
          category?: string
          created_at?: string
          feedback_id?: string
          id?: string
          is_premium?: boolean | null
          priority?: number | null
          suggestion?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvement_suggestions_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "interview_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_feedback: {
        Row: {
          analysis_summary: string | null
          body_language_score: number | null
          clarity_score: number | null
          communication_score: number | null
          confidence_score: number | null
          created_at: string
          domain_knowledge_score: number | null
          generated_at: string
          id: string
          overall_score: number | null
          session_id: string
          strengths: string[] | null
          updated_at: string
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          analysis_summary?: string | null
          body_language_score?: number | null
          clarity_score?: number | null
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          domain_knowledge_score?: number | null
          generated_at?: string
          id?: string
          overall_score?: number | null
          session_id: string
          strengths?: string[] | null
          updated_at?: string
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          analysis_summary?: string | null
          body_language_score?: number | null
          clarity_score?: number | null
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          domain_knowledge_score?: number | null
          generated_at?: string
          id?: string
          overall_score?: number | null
          session_id?: string
          strengths?: string[] | null
          updated_at?: string
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          company_name: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          interview_type: string
          metadata: Json | null
          role_applied: string | null
          settings: Json | null
          started_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interview_type?: string
          metadata?: Json | null
          role_applied?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          title?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interview_type?: string
          metadata?: Json | null
          role_applied?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_transcripts: {
        Row: {
          id: string
          message: string
          metadata: Json | null
          session_id: string | null
          speaker: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          message: string
          metadata?: Json | null
          session_id?: string | null
          speaker: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          message?: string
          metadata?: Json | null
          session_id?: string | null
          speaker?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      parsed_resumes: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          parsed_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          parsed_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          parsed_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_interviews: {
        Row: {
          candidate_name: string
          created_at: string
          duration_minutes: number
          id: string
          interview_title: string
          invited_email: string | null
          scheduled_at: string
          session_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_name: string
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_title: string
          invited_email?: string | null
          scheduled_at: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_title?: string
          invited_email?: string | null
          scheduled_at?: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_interviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
