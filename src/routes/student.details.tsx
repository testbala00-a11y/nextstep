import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { GraduationCap, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { normalizePhone } from "@/lib/student-profile";
export const Route = createFileRoute("/student/details")({ component: Page });
function Page() {
  const go = useNavigate();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"student" | "parent" | "">("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return go({ to: "/student/login" });
      const u = session.user;
      setUserId(u.id);
      setEmail(u.email || "");
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name,phone,user_type")
        .eq("id", u.id)
        .maybeSingle();
      setName(p?.full_name || u.user_metadata?.["full_name"] || u.user_metadata?.["name"] || "");
      setPhone(p?.phone || "");
      if (p?.user_type === "student" || p?.user_type === "parent") setType(p.user_type);
    })()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [go]);
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    const cleaned = normalizePhone(phone);
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!cleaned) return setError("Enter a valid 10-digit mobile number.");
    if (!type) return setError("Tell us whether you are a student or a parent.");
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: name.trim(), phone: cleaned, user_type: type });
    setBusy(false);
    if (error) setError(error.message);
    else go({ to: "/student/dashboard" });
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-emerald-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <form
          onSubmit={save}
          className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-xl"
        >
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">A few quick details</h1>
            <p className="mt-1 text-sm text-slate-500">
              So our team can help you with admissions. Only the NextStep owner can see these.
            </p>
          </div>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <>
              <fieldset>
                <legend className="text-sm font-semibold">I am a</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(
                    [
                      ["student", "Student", GraduationCap],
                      ["parent", "Parent", Users],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={type === value}
                      onClick={() => setType(value)}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-semibold ${
                        type === value ? "border-blue-700 bg-blue-50 text-blue-800" : ""
                      }`}
                    >
                      <Icon size={18} /> {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold">
                Full name
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </label>
              <label className="block text-sm font-semibold">
                Mobile number
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  readOnly
                  value={email}
                  className="mt-1 w-full rounded-lg border bg-slate-50 p-3 text-slate-600"
                />
              </label>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="w-full rounded-lg bg-blue-700 p-3 font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Continue"}
              </button>
            </>
          )}
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
