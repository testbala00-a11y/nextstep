import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { StudentWorkspace } from "@/components/StudentWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Building2, Compass, LogOut } from "lucide-react";
export const Route = createFileRoute("/student/dashboard")({ component: Page });
function Page() {
  const go = useNavigate();
  const [name, setName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data, error }) => {
        if (error || !data.user) {
          go({ to: "/student/login" });
          return;
        }
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.user.id)
          .maybeSingle();
        setName(p?.full_name || data.user.user_metadata?.["full_name"] || "Student");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [go]);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        {loading ? (
          <p>Loading your dashboard…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-emerald-700">Your NextStep workspace</p>
                <h1 className="mt-2 text-4xl font-bold text-brand-navy">Welcome, {name}!</h1>
                <p className="mt-2 text-slate-500">
                  Your future starts with exploring what fits you.
                </p>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  go({ to: "/student/login" });
                }}
                className="flex items-center gap-2 rounded-lg border bg-white p-3"
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  to: "/colleges" as const,
                  icon: Building2,
                  title: "Find colleges",
                  text: "Browse colleges and compare fees, courses and districts.",
                },
                {
                  to: "/courses" as const,
                  icon: BookOpen,
                  title: "Explore courses",
                  text: "Discover degree programmes and eligibility.",
                },
                {
                  to: "/student/assessment" as const,
                  icon: Compass,
                  title: "Plan my next step",
                  text: "Get courses and colleges matched to your interests, budget and location.",
                },
              ].map((x) => (
                <Link
                  key={x.title}
                  to={x.to}
                  className="rounded-2xl border bg-white p-7 shadow-sm hover:shadow-md"
                >
                  <x.icon size={32} className="text-blue-700" />
                  <h2 className="mt-5 text-xl font-bold">{x.title}</h2>
                  <p className="mt-2 text-slate-500">{x.text}</p>
                  <p className="mt-5 font-semibold text-blue-700">Explore →</p>
                </Link>
              ))}
            </div>
            <StudentWorkspace />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
