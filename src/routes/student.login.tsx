import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
export const Route = createFileRoute("/student/login")({ component: Page });
function Page() {
  const go = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  // Already signed in (including returning from Google): continue to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go({ to: "/student/dashboard" });
    });
  }, [go]);
  async function google() {
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/student/dashboard` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) {
          const { error: pError } = await supabase
            .from("profiles")
            .upsert({ id: data.user!.id, full_name: name });
          if (pError) throw pError;
          go({ to: "/student/dashboard" });
        } else
          setMessage("Account created. Check your email to verify your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        go({ to: "/student/dashboard" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-emerald-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-brand-navy">
            {mode === "login" ? "Welcome back!" : "Start your NextStep"}
          </h1>
          <p className="mt-2 text-slate-500">
            {mode === "login"
              ? "Students and parents, sign in to continue your college journey."
              : "Create your free NextStep account."}
          </p>
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border bg-white p-3 font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or use email{" "}
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <label className="block text-sm font-semibold">
                Full name
                <input
                  required
                  className="mt-1 w-full rounded-lg border p-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            <label className="block text-sm font-semibold">
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input
                required
                minLength={6}
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-lg border p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                {message}
              </p>
            )}
            <button
              disabled={busy}
              className="w-full rounded-lg bg-blue-700 p-3 font-bold text-white disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setMessage("");
            }}
            className="mt-5 w-full text-center text-sm font-semibold text-blue-700"
          >
            {mode === "login"
              ? "New here? Create an account with email"
              : "Already registered? Sign in"}
          </button>
          <p className="mt-5 text-center text-xs text-slate-500">
            NextStep team?{" "}
            <Link to="/admin/login" className="text-blue-700">
              Admin login
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
