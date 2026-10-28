import { supabase } from "@/integrations/supabase/client";

export async function getSavedCollegeIds() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("saved_colleges")
    .select("college_id")
    .eq("user_id", session.user.id);
  if (error) throw error;
  return new Set((data || []).map((r) => r.college_id));
}

/** Returns the new saved state, or null when the student must sign in first. */
export async function toggleSavedCollege(collegeId: string, saved: boolean) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  const query = saved
    ? supabase
        .from("saved_colleges")
        .delete()
        .eq("user_id", session.user.id)
        .eq("college_id", collegeId)
    : supabase.from("saved_colleges").insert({ user_id: session.user.id, college_id: collegeId });
  const { error } = await query;
  if (error) throw error;
  return !saved;
}
