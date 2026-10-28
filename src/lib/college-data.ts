import { supabase } from "@/integrations/supabase/client";
export type College = {
  id: string;
  name: string;
  district: string;
  college_type: string;
  address: string | null;
  description: string;
  annual_fee: number | null;
  fee_verified: boolean;
  fee_source_url: string | null;
  source_url: string | null;
  image_url?: string | null;
  status: "draft" | "published" | "unpublished";
};
export type Course = {
  id: string;
  name: string;
  description: string;
  duration: string | null;
  credential: string | null;
  entry_requirements: string;
  status: "draft" | "published" | "unpublished";
};
export type CollegeCourse = {
  id: string;
  college_id: string;
  course_name: string;
  level: string | null;
  stream: string | null;
  duration: string | null;
  seats: number | null;
  eligibility: string | null;
  entrance_exams: string | null;
  tuition_fee: number | null;
  fee_notes: string | null;
  sort_order: number;
};
export async function getColleges(includeDrafts = false) {
  let query = supabase.from("colleges").select("*").order("name");
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function getCourses(includeDrafts = false) {
  let query = supabase.from("courses").select("*").order("name");
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function getCollegeCourses(collegeId?: string) {
  let query = supabase.from("college_courses").select("*").order("sort_order").order("course_name");
  if (collegeId) query = query.eq("college_id", collegeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as CollegeCourse[];
}
export const fee = (n: number | null | undefined) =>
  n == null ? "Contact college for fees" : `₹${Number(n).toLocaleString("en-IN")}/year`;
export function externalUrl(s: string | null | undefined) {
  try {
    const u = new URL(s || "");
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}
