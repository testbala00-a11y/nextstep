import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminState } from "@/lib/admin-auth";
import { AdminShell } from "@/components/AdminShell";
export const Route = createFileRoute("/admin/onboarding")({ component: AdminOnboarding });
function AdminOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getAdminState()
      .then((s) => {
        if (!active) return;
        if (!s.user || !s.isAdmin) {
          navigate({ to: "/admin/login" });
          return;
        }
        if (s.profile?.onboarding_completed_at) {
          navigate({ to: "/admin" });
          return;
        }
        setName(s.profile?.full_name || "");
        setEmail(s.user.email || "");
        setChecking(false);
      })
      .catch(() => {
        if (active) {
          setError("Unable to verify administrator access.");
          setChecking(false);
        }
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please sign in again.");
      const { error: saveError } = await supabase
        .from("profiles")
        .update({ full_name: name.trim(), onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id);
      if (saveError) throw saveError;
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <AdminShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3 text-emerald-700">
          <ShieldCheck />
          <span className="text-sm font-semibold">Identity and administrator role verified</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-brand-navy">Set up your workspace</h1>
        <p className="mt-2 text-slate-600">
          Complete your administrator profile to access the NextStep control center.
        </p>
        {checking ? (
          <p className="mt-8">Checking access…</p>
        ) : (
          <form
            onSubmit={save}
            className="mt-8 space-y-5 rounded-2xl border bg-white p-7 shadow-sm"
          >
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="name">
                Your full name
              </label>
              <input
                id="name"
                required
                minLength={2}
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Administrator name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="mail">
                Verified email
              </label>
              <input
                id="mail"
                readOnly
                value={email}
                className="w-full rounded-lg border bg-slate-50 px-4 py-3 text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={18} /> Your admin permissions are managed securely in the
              database.
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Complete setup & open dashboard"}
            </button>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
