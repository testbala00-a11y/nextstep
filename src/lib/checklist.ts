import { supabase } from "@/integrations/supabase/client";

export type ChecklistItem = {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  college_id: string | null;
};

async function userId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

export async function getChecklist(): Promise<ChecklistItem[]> {
  const uid = await userId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("application_checklists")
    .select("id,title,due_date,completed_at,college_id")
    .eq("user_id", uid)
    .order("completed_at", { nullsFirst: true })
    .order("due_date", { nullsFirst: false })
    .order("created_at");
  if (error) throw error;
  return data || [];
}

/** Adds items whose titles aren't already on the list. Returns null when signed out. */
export async function addChecklistItems(
  items: { title: string; due_date?: string | null; college_id?: string | null }[],
) {
  const uid = await userId();
  if (!uid) return null;
  const existing = new Set((await getChecklist()).map((i) => i.title.toLowerCase()));
  const fresh = items.filter((i) => i.title.trim() && !existing.has(i.title.trim().toLowerCase()));
  if (!fresh.length) return 0;
  const { error } = await supabase
    .from("application_checklists")
    .insert(fresh.map((i) => ({ ...i, title: i.title.trim(), user_id: uid })));
  if (error) throw error;
  return fresh.length;
}

export async function setChecklistDone(id: string, done: boolean) {
  const { error } = await supabase
    .from("application_checklists")
    .update({ completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function removeChecklistItem(id: string) {
  const { error } = await supabase.from("application_checklists").delete().eq("id", id);
  if (error) throw error;
}
