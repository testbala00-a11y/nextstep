import { supabase } from "@/integrations/supabase/client";
import { AREAS, type AreaName, type Plan } from "@/lib/next-step";

// Plans are kept in this browser for everyone and also on the profile when signed in.
const KEY = "nextstep-plan";
export const emptyPlan: Plan = {
  interests: [],
  background: "",
  level: "UG",
  states: [],
  budget: null,
  exams: [],
};
const areaNames = new Set<string>(AREAS.map((a) => a.name));

function fromLocal(): Plan | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && Array.isArray(v.interests) ? { ...emptyPlan, ...v } : null;
  } catch {
    return null;
  }
}

export async function loadPlan(): Promise<Plan | null> {
  const local = fromLocal();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return local;
  const { data } = await supabase
    .from("profiles")
    .select("interests,stream,fee_budget,preferred_states,preferred_level,exams_taken")
    .eq("id", session.user.id)
    .maybeSingle();
  const interests = (data?.interests || []).filter((i) => areaNames.has(i)) as AreaName[];
  if (!data || !interests.length) return local;
  return {
    interests,
    background: data.stream || "",
    level: data.preferred_level || "",
    states: data.preferred_states || [],
    budget: data.fee_budget,
    exams: data.exams_taken || [],
  };
}

/** Returns true when the plan was also saved to the signed-in student's profile. */
export async function savePlan(plan: Plan) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plan));
  } catch {
    // storage unavailable
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;
  const { error } = await supabase
    .from("profiles")
    .update({
      interests: plan.interests,
      stream: plan.background || null,
      fee_budget: plan.budget,
      preferred_states: plan.states,
      preferred_level: plan.level || null,
      exams_taken: plan.exams,
    })
    .eq("id", session.user.id);
  if (error) throw error;
  return true;
}
