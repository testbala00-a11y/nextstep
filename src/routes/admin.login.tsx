import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminState } from "@/lib/admin-auth";
export const Route = createFileRoute("/admin/login")({ component: AdminLogin });
function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      const result = await getAdminState();
      if (!result.isAdmin) {
        await supabase.auth.signOut();
        setError("This account does not have administrator access. Contact the NextStep owner.");
        return;
      }
      navigate({ to: result.profile?.onboarding_completed_at ? "/admin" : "/admin/onboarding" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to NextStep
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-blue-900/5">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ShieldCheck size={25} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Restricted workspace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-brand-navy">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage NextStep securely using your approved administrator account.
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-12 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  aria-label={show ? "Hide password" : "Show password"}
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              {loading ? "Verifying access…" : "Secure sign in"}
            </button>
          </form>
          <Link
            to="/admin/reset-password"
            className="mt-5 block text-center text-sm font-medium text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500">
          New administrators are provisioned privately. Public admin registration is disabled.
        </p>
      </div>
    </div>
  );
}
