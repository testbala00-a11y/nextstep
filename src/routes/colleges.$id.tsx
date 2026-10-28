import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  Building2,
  ArrowLeft,
  Heart,
  GitCompare,
  BookOpen,
  IndianRupee,
  ClipboardCheck,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CompareBar } from "@/components/CompareBar";
import { useCompare, MAX_COMPARE } from "@/lib/compare";
import { getSavedCollegeIds, toggleSavedCollege } from "@/lib/saved-colleges";
import {
  getColleges,
  getCollegeCourses,
  summarize,
  feeRange,
  fee,
  externalUrl,
  type College,
  type CollegeCourse,
} from "@/lib/college-data";
export const Route = createFileRoute("/colleges/$id")({ component: Detail });
const TABS = ["Overview", "Courses & Fees", "Admissions"] as const;
type Tab = (typeof TABS)[number];
const inr = (n: number | null) => (n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`);
function countByLevel(courses: CollegeCourse[]) {
  const out: Record<string, number> = {};
  for (const c of courses) out[c.level || "Other"] = (out[c.level || "Other"] || 0) + 1;
  return out;
}
function Detail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState<College | null>(null);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<CollegeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const compare = useCompare();
  useEffect(() => {
    Promise.all([getColleges(), getCollegeCourses(id)])
      .then(([cc, co]) => {
        setAllColleges(cc);
        setCollege(cc.find((x) => x.id === id) || null);
        setCourses(co);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    getSavedCollegeIds()
      .then((ids) => setSaved(!!ids?.has(id)))
      .catch(() => undefined);
  }, [id]);
  async function toggleSave() {
    setNotice("");
    try {
      const next = await toggleSavedCollege(id, saved);
      if (next === null) navigate({ to: "/student/login" });
      else setSaved(next);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save college.");
    }
  }
  const link = externalUrl(college?.source_url);
  const summary = summarize(courses);
  const levelCounts = countByLevel(courses);
  const needle = q.trim().toLowerCase();
  const visible = courses.filter(
    (c) =>
      (level === "all" || (c.level || "Other") === level) &&
      (!needle || [c.course_name, c.stream].join(" ").toLowerCase().includes(needle)),
  );
  const groups = visible.reduce<Record<string, CollegeCourse[]>>((acc, c) => {
    (acc[c.level || "Other"] ||= []).push(c);
    return acc;
  }, {});
  const pill = (active: string) =>
    `inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${active}`;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-10">
        <Link to="/colleges" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-700">
          <ArrowLeft size={16} /> All colleges
        </Link>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : !college ? (
          <div className="rounded-2xl border bg-white p-10">
            College not found or not published.
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              {college.image_url ? (
                <img
                  src={college.image_url}
                  alt={`${college.name} campus`}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-blue-100">
                  <Building2 size={64} className="text-blue-500" />
                </div>
              )}
              <div className="p-6">
                <span className="text-xs font-bold uppercase text-emerald-700">
                  {college.college_type || "College"}
                </span>
                <h1 className="mt-1 text-3xl font-bold text-brand-navy">{college.name}</h1>
                <p className="mt-2 flex gap-2 text-slate-600">
                  <MapPin size={18} className="shrink-0" />
                  {[college.address, college.district, college.state].filter(Boolean).join(", ")}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={toggleSave}
                    className={pill(
                      saved ? "border-rose-200 bg-rose-50 text-rose-700" : "text-slate-700",
                    )}
                  >
                    <Heart size={16} fill={saved ? "currentColor" : "none"} />
                    {saved ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() =>
                      setNotice(
                        compare.toggle(id)
                          ? ""
                          : `You can compare up to ${MAX_COMPARE} colleges. Remove one first.`,
                      )
                    }
                    className={pill(
                      compare.has(id)
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "text-slate-700",
                    )}
                  >
                    <GitCompare size={16} />
                    {compare.has(id) ? "Added to compare" : "Compare"}
                  </button>
                  {link && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={link}
                      className="inline-flex items-center px-2 py-2 text-sm font-semibold text-blue-700 underline"
                    >
                      Official website ↗
                    </a>
                  )}
                </div>
                {notice && <p className="mt-3 text-sm text-amber-700">{notice}</p>}
              </div>
              <nav className="flex overflow-x-auto border-t" aria-label="College sections">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold ${
                      tab === t
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </nav>
            </div>

            {tab === "Overview" && (
              <section className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: BookOpen, label: "Courses offered", value: String(summary.count) },
                    { icon: IndianRupee, label: "Annual fee range", value: feeRange(summary) },
                    {
                      icon: ClipboardCheck,
                      label: "Exams accepted",
                      value: summary.exams.slice(0, 3).join(", ") || "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl border bg-white p-5">
                      <Icon className="text-blue-700" size={20} />
                      <p className="mt-2 text-sm text-slate-500">{label}</p>
                      <p className="mt-1 font-bold text-brand-navy">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border bg-white p-6">
                  <h2 className="text-xl font-bold text-brand-navy">About {college.name}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-slate-700">
                    {college.description || "Description coming soon."}
                  </p>
                  {summary.levels.length > 0 && (
                    <p className="mt-4 text-sm">
                      <strong>Programme levels:</strong> {summary.levels.join(", ")}
                    </p>
                  )}
                  {summary.streams.length > 0 && (
                    <p className="mt-1 text-sm">
                      <strong>Streams:</strong> {summary.streams.join(", ")}
                    </p>
                  )}
                </div>
                {courses.length > 0 && (
                  <button
                    onClick={() => setTab("Courses & Fees")}
                    className="font-semibold text-blue-700"
                  >
                    View all {courses.length} courses and fees →
                  </button>
                )}
              </section>
            )}

            {tab === "Courses & Fees" && (
              <section className="mt-6">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {["all", ...Object.keys(levelCounts)].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        level === l ? "border-blue-700 bg-blue-700 text-white" : "bg-white"
                      }`}
                    >
                      {l === "all" ? `All (${courses.length})` : `${l} (${levelCounts[l]})`}
                    </button>
                  ))}
                  <input
                    aria-label="Search courses in this college"
                    placeholder="Search course"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-lg border px-3 py-1.5 text-sm sm:ml-auto sm:w-56"
                  />
                </div>
                <div className="space-y-6">
                  {Object.entries(groups).map(([lvl, list]) => (
                    <div key={lvl}>
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                        {lvl} · {list.length} course{list.length === 1 ? "" : "s"}
                      </h3>
                      <div className="space-y-3">
                        {list.map((c) => (
                          <div key={c.id} className="rounded-xl border bg-white p-5">
                            <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                              <div>
                                <h4 className="font-bold">{c.course_name}</h4>
                                <p className="text-sm text-slate-500">
                                  {[c.stream, c.duration, c.study_mode].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                              <div className="mt-2 shrink-0 sm:mt-0 sm:text-right">
                                <strong>{fee(c.tuition_fee)}</strong>
                                {c.total_fee != null && (
                                  <p className="text-xs text-slate-500">
                                    Total: {inr(c.total_fee)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                              {(
                                [
                                  ["Seats", c.seats],
                                  ["Cutoff", c.cutoff],
                                  ["Exams", c.entrance_exams],
                                  ["Eligibility", c.eligibility],
                                ] as const
                              ).map(([label, value]) =>
                                value == null || value === "" ? null : (
                                  <div key={label}>
                                    <dt className="inline font-semibold">{label}: </dt>
                                    <dd className="inline">{value}</dd>
                                  </div>
                                ),
                              )}
                            </dl>
                            {c.fee_notes && (
                              <p className="mt-2 text-xs text-slate-500">{c.fee_notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {visible.length === 0 && (
                    <p className="rounded-xl border bg-white p-5 text-slate-500">
                      {courses.length ? "No courses match." : "No courses listed yet."}
                    </p>
                  )}
                </div>
              </section>
            )}

            {tab === "Admissions" && (
              <section className="mt-6 overflow-x-auto rounded-2xl border bg-white">
                {courses.length ? (
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="p-3">Course</th>
                        <th className="p-3">Eligibility</th>
                        <th className="p-3">Entrance exams</th>
                        <th className="p-3">Cutoff</th>
                        <th className="p-3">Seats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id} className="border-t align-top">
                          <td className="p-3 font-semibold">{c.course_name}</td>
                          <td className="p-3">{c.eligibility || "—"}</td>
                          <td className="p-3">{c.entrance_exams || "—"}</td>
                          <td className="p-3">{c.cutoff || "—"}</td>
                          <td className="p-3">{c.seats ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-5 text-slate-500">Admission details coming soon.</p>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <CompareBar colleges={allColleges} />
      <SiteFooter />
    </div>
  );
}
