export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_members: {
        Row: { user_id: string; access_level: "super_admin" | "staff_admin"; created_at: string };
        Insert: {
          user_id: string;
          access_level: "super_admin" | "staff_admin";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          access_level?: "super_admin" | "staff_admin";
          created_at?: string;
        };
        Relationships: [];
      };
      admission_notices: {
        Row: {
          body: string;
          college_id: string | null;
          course_id: string | null;
          created_at: string;
          deadline_at: string | null;
          id: string;
          last_verified_at: string | null;
          source_url: string | null;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          college_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          deadline_at?: string | null;
          id?: string;
          last_verified_at?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          college_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          deadline_at?: string | null;
          id?: string;
          last_verified_at?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_notices_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admission_notices_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      application_checklists: {
        Row: {
          college_id: string | null;
          completed_at: string | null;
          created_at: string;
          details: string;
          due_date: string | null;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          college_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          details?: string;
          due_date?: string | null;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          college_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          details?: string;
          due_date?: string | null;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_checklists_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_questions: {
        Row: {
          created_at: string;
          id: string;
          options: Json;
          position: number;
          prompt: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          options?: Json;
          position: number;
          prompt: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          options?: Json;
          position?: number;
          prompt?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_responses: {
        Row: {
          attempt_id: string;
          created_at: string;
          id: string;
          question_id: string;
          response: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          created_at?: string;
          id?: string;
          question_id: string;
          response: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          created_at?: string;
          id?: string;
          question_id?: string;
          response?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_responses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      career_courses: {
        Row: {
          career_id: string;
          course_id: string;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          career_id: string;
          course_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          career_id?: string;
          course_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "career_courses_career_id_fkey";
            columns: ["career_id"];
            isOneToOne: false;
            referencedRelation: "careers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "career_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      careers: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          pathways: string[];
          required_interests: string[];
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          pathways?: string[];
          required_interests?: string[];
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          pathways?: string[];
          required_interests?: string[];
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      college_courses: {
        Row: {
          tuition_fee: number | null;
          course_name: string;
          level: string | null;
          stream: string | null;
          duration: string | null;
          seats: number | null;
          total_fee: number | null;
          cutoff: string | null;
          study_mode: string | null;
          eligibility: string | null;
          entrance_exams: string | null;
          sort_order: number;
          fee_notes: string | null;
          college_id: string;
          course_id: string | null;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          tuition_fee?: number | null;
          course_name: string;
          level?: string | null;
          stream?: string | null;
          duration?: string | null;
          seats?: number | null;
          total_fee?: number | null;
          cutoff?: string | null;
          study_mode?: string | null;
          eligibility?: string | null;
          entrance_exams?: string | null;
          sort_order?: number;
          fee_notes?: string | null;
          college_id: string;
          course_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          tuition_fee?: number | null;
          course_name?: string;
          level?: string | null;
          stream?: string | null;
          duration?: string | null;
          seats?: number | null;
          total_fee?: number | null;
          cutoff?: string | null;
          study_mode?: string | null;
          eligibility?: string | null;
          entrance_exams?: string | null;
          sort_order?: number;
          fee_notes?: string | null;
          college_id?: string;
          course_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "college_courses_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "college_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      colleges: {
        Row: {
          image_url: string | null;
          address: string | null;
          annual_fee: number | null;
          college_type: string;
          created_at: string;
          description: string;
          district: string;
          state: string;
          fee_last_verified_at: string | null;
          fee_source_url: string | null;
          fee_verified: boolean;
          id: string;
          last_verified_at: string | null;
          name: string;
          source_url: string | null;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          image_url?: string | null;
          address?: string | null;
          annual_fee?: number | null;
          college_type?: string;
          created_at?: string;
          description?: string;
          district?: string;
          state?: string;
          fee_last_verified_at?: string | null;
          fee_source_url?: string | null;
          fee_verified?: boolean;
          id?: string;
          last_verified_at?: string | null;
          name: string;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          image_url?: string | null;
          address?: string | null;
          annual_fee?: number | null;
          college_type?: string;
          created_at?: string;
          description?: string;
          district?: string;
          state?: string;
          fee_last_verified_at?: string | null;
          fee_source_url?: string | null;
          fee_verified?: boolean;
          id?: string;
          last_verified_at?: string | null;
          name?: string;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          created_at: string;
          credential: string | null;
          description: string;
          duration: string | null;
          entry_requirements: string;
          id: string;
          name: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          credential?: string | null;
          description?: string;
          duration?: string | null;
          entry_requirements?: string;
          id?: string;
          name: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          credential?: string | null;
          description?: string;
          duration?: string | null;
          entry_requirements?: string;
          id?: string;
          name?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          district: string | null;
          fee_budget: number | null;
          preferred_states: string[];
          preferred_level: string | null;
          exams_taken: string[];
          full_name: string | null;
          id: string;
          interests: string[];
          onboarding_completed_at: string | null;
          school_class: string | null;
          stream: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          district?: string | null;
          fee_budget?: number | null;
          preferred_states?: string[];
          preferred_level?: string | null;
          exams_taken?: string[];
          full_name?: string | null;
          id: string;
          interests?: string[];
          onboarding_completed_at?: string | null;
          school_class?: string | null;
          stream?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          district?: string | null;
          fee_budget?: number | null;
          preferred_states?: string[];
          preferred_level?: string | null;
          exams_taken?: string[];
          full_name?: string | null;
          id?: string;
          interests?: string[];
          onboarding_completed_at?: string | null;
          school_class?: string | null;
          stream?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_careers: {
        Row: {
          career_id: string;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          career_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          career_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_careers_career_id_fkey";
            columns: ["career_id"];
            isOneToOne: false;
            referencedRelation: "careers";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_colleges: {
        Row: {
          college_id: string;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          college_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          college_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_colleges_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_nextstep_super_admin: {
        Args: { _user: string };
        Returns: boolean;
      };
      list_nextstep_staff: {
        Args: Record<PropertyKey, never>;
        Returns: {
          user_id: string;
          email: string;
          full_name: string | null;
          access_level: string;
          created_at: string;
        }[];
      };
      manage_nextstep_staff: {
        Args: { _email: string; _grant_access: boolean };
        Returns: string;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "student" | "admin";
      content_status: "draft" | "published" | "unpublished";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "admin"],
      content_status: ["draft", "published", "unpublished"],
    },
  },
} as const;
