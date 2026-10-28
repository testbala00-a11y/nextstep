import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type NewStaff = { email: string; password: string; fullName: string };

function validate(input: unknown): NewStaff {
  const d = (input ?? {}) as Partial<NewStaff>;
  const email = String(d.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(d.password ?? "");
  const fullName = String(d.fullName ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (fullName.length < 2) throw new Error("Enter the staff member's full name.");
  return { email, password, fullName };
}

/**
 * Super admin creates a staff login directly: the account is confirmed and ready
 * to sign in, with no email verification or onboarding step for the staff member.
 */
export const createStaffLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { data: member } = await context.supabase
      .from("admin_members")
      .select("access_level")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (member?.access_level !== "super_admin")
      throw new Error("Only the super admin can create staff logins.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    const id = created.user.id;
    const steps = await Promise.all([
      supabaseAdmin.from("profiles").upsert({
        id,
        full_name: data.fullName,
        onboarding_completed_at: new Date().toISOString(),
      }),
      supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: id, role: "admin" }, { onConflict: "user_id,role" }),
      supabaseAdmin.from("admin_members").upsert({ user_id: id, access_level: "staff_admin" }),
    ]);
    const failed = steps.find((s) => s.error);
    if (failed?.error) {
      await supabaseAdmin.auth.admin.deleteUser(id);
      throw new Error(failed.error.message);
    }
    return { email: data.email };
  });
