import { supabase } from "@/integrations/supabase/client";
export type College = {
  id: string;
  name: string;
  district: string;
  state?: string;
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
  total_fee: number | null;
  cutoff: string | null;
  study_mode: string | null;
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
export type CourseSummary = {
  count: number;
  minFee: number | null;
  maxFee: number | null;
  levels: string[];
  streams: string[];
  exams: string[];
};
const uniq = (xs: (string | null | undefined)[]) =>
  Array.from(new Set(xs.map((x) => x?.trim()).filter((x): x is string => !!x))).sort();
export const splitExams = (s: string | null) => (s ? s.split(/[,;/]/) : []);
export function summarize(courses: CollegeCourse[]): CourseSummary {
  const fees = courses.map((c) => c.tuition_fee).filter((f): f is number => f != null);
  return {
    count: courses.length,
    minFee: fees.length ? Math.min(...fees) : null,
    maxFee: fees.length ? Math.max(...fees) : null,
    levels: uniq(courses.map((c) => c.level)),
    streams: uniq(courses.map((c) => c.stream)),
    exams: uniq(courses.flatMap((c) => splitExams(c.entrance_exams))),
  };
}
const lakh = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} L` : `₹${n.toLocaleString("en-IN")}`;
export function feeRange(s: Pick<CourseSummary, "minFee" | "maxFee">) {
  if (s.minFee == null || s.maxFee == null) return "Fees on request";
  return s.minFee === s.maxFee
    ? `${lakh(s.minFee)}/yr`
    : `${lakh(s.minFee)} – ${lakh(s.maxFee)}/yr`;
}
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
