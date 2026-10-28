import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { createStaffLogin } from "@/lib/staff.functions";

export const Route = createFileRoute("/admin/staff")({ component: Page });

type StaffMember = {
  user_id: string;
  email: string;
  full_name: string | null;
  access_level: string;
  created_at: string;
};

function Page() {
  return (
    <AdminGate superAdminOnly>
      <StaffAccess />
    </AdminGate>
  );
}

function StaffAccess() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const { data, error } = await supabase.rpc("list_nextstep_staff");
    if (error) throw error;
    setStaff(data || []);
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const { email } = await createStaffLogin({ data: form });
      setMessage(`Staff login created for ${email}. Share the password with them securely.`);
      setForm({ fullName: "", email: "", password: "" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create staff login.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(member: StaffMember) {
    if (!window.confirm(`Revoke admin access for ${member.email}?`)) return;
    setMessage("");
    setError("");
    const { data, error } = await supabase.rpc("manage_nextstep_staff", {
      _email: member.email,
      _grant_access: false,
    });
    if (error) setError(error.message);
    else {
      setMessage(String(data || "Access revoked."));
      refresh().catch((e) => setError(e.message));
    }
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Staff logins</h1>
      <p className="mt-2 text-slate-600">
        Create logins for staff who enter college data. Staff can add, edit, publish and delete
        colleges and courses; only you can manage staff.
      </p>
      <form
        className="mt-7 max-w-xl space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
        onSubmit={create}
      >
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <UserPlus size={20} /> New staff login
        </h2>
        <label className="block text-sm font-semibold">
          Full name
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="staff@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password (min 8 characters)
          <div className="mt-1 flex items-center rounded-lg border border-slate-300">
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg px-3 py-2.5 outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="px-3 text-slate-500"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button
          disabled={busy}
          type="submit"
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create staff login"}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className="mt-4 max-w-xl rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 max-w-xl rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <h2 className="mt-10 text-xl font-bold text-brand-navy">Current admins</h2>
      <div className="mt-3 space-y-2">
        {staff.map((m) => (
          <div
            key={m.user_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
          >
            <div>
              <p className="font-semibold">{m.full_name || m.email}</p>
              <p className="text-sm text-slate-500">
                {m.email} · {m.access_level === "super_admin" ? "Super admin" : "Staff"}
              </p>
            </div>
            {m.access_level !== "super_admin" && (
              <button
                onClick={() => revoke(m)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Revoke access
              </button>
            )}
          </div>
        ))}
        {!staff.length && <p className="text-slate-500">No staff yet.</p>}
      </div>
    </>
  );
}
