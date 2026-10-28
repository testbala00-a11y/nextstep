import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminState = {
  user: User | null;
  isAdmin: boolean;
  profile: { full_name: string | null; onboarding_completed_at: string | null } | null;
  accessLevel: string | null;
};

// Verified once per signed-in user and reused across admin pages until sign-out,
// so moving between admin screens never shows the verification step again.
let cached: { userId: string; state: AdminState } | null = null;
let pending: Promise<AdminState> | null = null;

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || (cached && session?.user.id !== cached.userId)) clearAdminState();
});

export function clearAdminState() {
  cached = null;
  pending = null;
}

export function getCachedAdminState() {
  return cached?.state ?? null;
}

/** Super admins never need onboarding; staff complete it once. */
export function needsOnboarding(s: AdminState) {
  return s.accessLevel !== "super_admin" && !s.profile?.onboarding_completed_at;
}

export function getAdminState(): Promise<AdminState> {
  if (cached) return Promise.resolve(cached.state);
  pending ??= loadAdminState()
    .then((state) => {
      if (state.user && state.isAdmin) cached = { userId: state.user.id, state };
      return state;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

async function loadAdminState(): Promise<AdminState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { user: null, isAdmin: false, profile: null, accessLevel: null };
  const [role, profile, member] = await Promise.all([
    supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name,onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("admin_members").select("access_level").eq("user_id", user.id).maybeSingle(),
  ]);
  if (role.error) throw role.error;
  if (!role.data) return { user, isAdmin: false, profile: null, accessLevel: null };
  if (profile.error) throw profile.error;
  if (member.error) throw member.error;
  return {
    user,
    isAdmin: true,
    profile: profile.data,
    accessLevel: member.data?.access_level ?? null,
  };
}
