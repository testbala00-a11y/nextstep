import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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
              ? "Sign in to continue your college journey."
              : "Create your free student account."}
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
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
              ? "New here? Create a student account"
              : "Already registered? Sign in"}
          </button>
          <p className="mt-5 text-center text-xs text-slate-500">
            Are you an administrator?{" "}
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
