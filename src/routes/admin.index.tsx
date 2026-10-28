import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Building2, BriefcaseBusiness, ClipboardList, Users, Bell } from "lucide-react";
import { getAdminState, needsOnboarding } from "@/lib/admin-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
export const Route = createFileRoute("/admin/")({ component: Dashboard });
type Metric = { title: string; value: number | null; icon: typeof Users };
function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const s = await getAdminState();
        if (!active) return;
        if (!s.user || !s.isAdmin) {
          navigate({ to: "/admin/login" });
          return;
        }
        if (needsOnboarding(s)) {
          navigate({ to: "/admin/onboarding" });
          return;
        }
        setName(s.profile?.full_name || "Administrator");
        setIsSuperAdmin(s.accessLevel === "super_admin");
        const tables = [
          "profiles",
          "careers",
          "college_courses",
          "colleges",
          "assessment_questions",
          "admission_notices",
        ] as const;
        const values = await Promise.all(
          tables.map(async (table) => {
            const { count, error } = await supabase
              .from(table)
              .select("*", { count: "exact", head: true });
            return { table, count: error ? null : count };
          }),
        );
        if (active) setCounts(Object.fromEntries(values.map((v) => [v.table, v.count])));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [navigate]);
  const metrics: Metric[] = [
    { title: "Students", value: counts["profiles"] ?? null, icon: Users },
    { title: "Careers", value: counts["careers"] ?? null, icon: BriefcaseBusiness },
    { title: "Courses", value: counts["college_courses"] ?? null, icon: BookOpen },
    { title: "Colleges", value: counts["colleges"] ?? null, icon: Building2 },
    {
      title: "Assessment questions",
      value: counts["assessment_questions"] ?? null,
      icon: ClipboardList,
    },
    { title: "Admission notices", value: counts["admission_notices"] ?? null, icon: Bell },
  ];
  return (
    <AdminShell isSuperAdmin={isSuperAdmin}>
      <div className="mb-8">
        <p className="text-sm font-semibold text-emerald-700">NextStep control center</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-navy">Welcome, {name}</h1>
        <p className="mt-2 text-slate-600">Overview of your connected NextStep platform.</p>
      </div>
      {loading ? (
        <p role="status">Loading your dashboard…</p>
      ) : error ? (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                <m.icon className="mb-4 text-blue-700" size={24} />
                <p className="text-sm text-slate-500">{m.title}</p>
                <p className="mt-1 text-3xl font-bold text-brand-navy">{m.value ?? "—"}</p>
              </div>
            ))}
          </div>
          <section className="mt-7 rounded-2xl border bg-white p-6">
            <h2 className="font-heading text-xl font-bold">Manage your college catalog</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the Colleges, Courses and Course fees sections on the left to publish college
              listings, upload images and manage tuition. Only published content appears publicly. A
              dash (—) indicates that a metric could not be read with the current database
              permissions.
            </p>
          </section>
        </>
      )}
    </AdminShell>
  );
}
