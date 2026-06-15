// Tipos de la base de datos.
// Generados a mano para el MVP; regenera con:  npm run db:types
// (requiere `supabase start` o un proyecto enlazado).

export type UserRole = "student" | "admin";
export type RiasecDim = "R" | "I" | "A" | "S" | "E" | "C";
export type AssessmentStatus = "in_progress" | "completed";
export type DemandLevel = "low" | "medium" | "high";
export type EducationLevel =
  | "secundaria"
  | "bachillerato"
  | "tecnico"
  | "universitario"
  | "posgrado"
  | "otro";

// ─── Filas (Row) por tabla ────────────────────────────────────────────
// Se usan `type` (no `interface`): los object-literal types obtienen una
// firma de índice implícita y así satisfacen `Record<string, unknown>`,
// requisito de GenericTable en supabase-js. Con `interface` fallaría.
export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  education_level: EducationLevel | null;
  birth_date: string | null;
  initial_interests: string | null;
  role: UserRole;
  accessibility_prefs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type QuestionnaireRow = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuestionRow = {
  id: string;
  questionnaire_id: string;
  text: string;
  dimension: RiasecDim;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export type CareerRow = {
  id: string;
  name: string;
  description: string | null;
  riasec_code: string;
  field: string | null;
  avg_duration_years: number | null;
  academic_demand: DemandLevel | null;
  job_demand: DemandLevel | null;
  avg_monthly_cost: number | null;
  job_market_outlook: string | null;
  university_examples: string[];
  key_skills: string[];
  is_active: boolean;
  created_at: string;
}

export type AssessmentRow = {
  id: string;
  user_id: string;
  questionnaire_id: string | null;
  status: AssessmentStatus;
  scores: Partial<Record<RiasecDim, number>>;
  holland_code: string | null;
  started_at: string;
  completed_at: string | null;
}

export type AssessmentResponseRow = {
  id: string;
  assessment_id: string;
  question_id: string;
  value: number;
  created_at: string;
}

export type RecommendationRow = {
  id: string;
  assessment_id: string;
  career_id: string;
  score: number;
  rank: number;
  explanation: string | null;
  created_at: string;
}

export type ActionPlanRow = {
  id: string;
  assessment_id: string;
  user_id: string;
  title: string;
  steps: { label: string; done: boolean }[];
  created_at: string;
  updated_at: string;
}

export type ReportRow = {
  id: string;
  assessment_id: string;
  user_id: string;
  storage_path: string | null;
  format: string;
  created_at: string;
}

export type SavedComparisonRow = {
  id: string;
  user_id: string;
  career_ids: string[];
  created_at: string;
}

// Helper: una tabla con Row, e Insert/Update derivados de la fila.
type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id">;
      questionnaires: Table<QuestionnaireRow, "title">;
      questions: Table<QuestionRow, "questionnaire_id" | "text" | "dimension">;
      careers: Table<CareerRow, "name" | "riasec_code">;
      assessments: Table<AssessmentRow, "user_id">;
      assessment_responses: Table<
        AssessmentResponseRow,
        "assessment_id" | "question_id" | "value"
      >;
      recommendations: Table<
        RecommendationRow,
        "assessment_id" | "career_id" | "score" | "rank"
      >;
      action_plans: Table<ActionPlanRow, "assessment_id" | "user_id">;
      reports: Table<ReportRow, "assessment_id" | "user_id">;
      saved_comparisons: Table<SavedComparisonRow, "user_id">;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      riasec_dim: RiasecDim;
      assessment_status: AssessmentStatus;
      demand_level: DemandLevel;
      education_level: EducationLevel;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
