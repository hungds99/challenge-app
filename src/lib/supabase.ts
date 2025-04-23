import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  status: "draft" | "pending" | "published";
  expected_answers?: string[];
  explanation: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  role: "admin" | "contributor" | "user";
  username: string;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  challenge_id: string;
  user_id: string;
  answer: string;
  status: "pending" | "approved" | "rejected";
  points: number;
  created_at: string;
  updated_at: string;
};
