import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, X } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useCompare } from "@/lib/compare";
import {
  getColleges,
  getCollegeCourses,
  summarize,
  feeRange,
  type College,
  type CollegeCourse,
} from "@/lib/college-data";
export const Route = createFileRoute("/colleges/compare")({ component: Compare });
function Compare() {
  const compare = useCompare();
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<CollegeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getColleges(), getCollegeCourses()])
      .then(([cc, co]) => {
        setColleges(cc);
        setCourses(co);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const picked = compare.ids
    .map((id) => colleges.find((c) => c.id === id))
    .filter((c): c is College => !!c)
    .map((c) => {
      const own = courses.filter((x) => x.college_id === c.id);
      return { college: c, courses: own, summary: summarize(own) };
    });
  // Courses offered by more than one picked college, compared fee by fee.
  const common = Array.from(
    new Set(picked.flatMap((p) => p.courses.map((c) => c.course_name.trim().toLowerCase()))),
  ).filter(
    (n) =>
      picked.filter((p) => p.courses.some((c) => c.course_name.trim().toLowerCase() === n)).length >
      1,
  );
  const rows: [string, (p: (typeof picked)[number]) => string][] = [
    ["Location", (p) => [p.college.district, p.college.state].filter(Boolean).join(", ") || "—"],
    ["Type", (p) => p.college.college_type || "—"],
    ["Courses offered", (p) => String(p.summary.count)],
    ["Annual fee range", (p) => feeRange(p.summary)],
    ["Levels", (p) => p.summary.levels.join(", ") || "—"],
    ["Streams", (p) => p.summary.streams.join(", ") || "—"],
    ["Exams accepted", (p) => p.summary.exams.join(", ") || "—"],
  ];
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <Link to="/colleges" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-700">
          <ArrowLeft size={16} /> Back to colleges
        </Link>
        <h1 className="text-3xl font-bold text-brand-navy">Compare colleges</h1>
        {loading ? (
          <p className="mt-6">Loading…</p>
        ) : error ? (
          <p role="alert" className="mt-6 text-red-700">
            {error}
          </p>
        ) : picked.length < 2 ? (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center">
            <Building2 className="mx-auto mb-3 text-blue-500" size={38} />
            <p className="text-slate-600">
              Pick at least two colleges using the Compare checkbox on the colleges page.
            </p>
            <Link to="/colleges" className="mt-4 inline-block font-semibold text-blue-700">
              Browse colleges →
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="align-top">
                  <th className="w-44 p-4" />
                  {picked.map((p) => (
                    <th key={p.college.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/colleges/$id"
                          params={{ id: p.college.id }}
                          className="text-base font-bold text-brand-navy hover:text-blue-700"
                        >
                          {p.college.name}
                        </Link>
                        <button
                          aria-label={`Remove ${p.college.name}`}
                          onClick={() => compare.toggle(p.college.id)}
                          className="text-slate-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label} className="border-t align-top">
                    <th className="bg-slate-50 p-4 font-semibold text-slate-600">{label}</th>
                    {picked.map((p) => (
                      <td key={p.college.id} className="p-4">
                        {value(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                {common.length > 0 && (
                  <tr className="border-t">
                    <th
                      colSpan={picked.length + 1}
                      className="bg-blue-50 p-3 text-sm font-bold text-blue-800"
                    >
                      Same course, side by side (annual fee · cutoff)
                    </th>
                  </tr>
                )}
                {common.map((name) => (
                  <tr key={name} className="border-t align-top">
                    <th className="bg-slate-50 p-4 font-semibold capitalize text-slate-600">
                      {name}
                    </th>
                    {picked.map((p) => {
                      const c = p.courses.find((x) => x.course_name.trim().toLowerCase() === name);
                      return (
                        <td key={p.college.id} className="p-4">
                          {c
                            ? [
                                c.tuition_fee != null
                                  ? `₹${Number(c.tuition_fee).toLocaleString("en-IN")}/yr`
                                  : "Fee on request",
                                c.cutoff,
                              ]
                                .filter(Boolean)
                                .join(" · ")
                            : "Not offered"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
