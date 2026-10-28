import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Building2, IndianRupee, BookOpen, SlidersHorizontal } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CompareBar } from "@/components/CompareBar";
import { useCompare, MAX_COMPARE } from "@/lib/compare";
import {
  getColleges,
  getCollegeCourses,
  summarize,
  feeRange,
  splitExams,
  type College,
  type CollegeCourse,
  type CourseSummary,
} from "@/lib/college-data";
export const Route = createFileRoute("/colleges/")({ component: Colleges });
type Row = College & { courses: CollegeCourse[]; summary: CourseSummary };
const ALL = "all";
const FEE_CAPS = [50000, 100000, 200000, 500000];
const options = (rows: Row[], pick: (r: Row) => string[]) =>
  Array.from(new Set(rows.flatMap(pick).filter(Boolean))).sort();
function Colleges() {
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [state, setState] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [stream, setStream] = useState(ALL);
  const [exam, setExam] = useState(ALL);
  const [maxFee, setMaxFee] = useState(ALL);
  const [sort, setSort] = useState("name");
  const [notice, setNotice] = useState("");
  const compare = useCompare();
  useEffect(() => {
    Promise.all([getColleges(), getCollegeCourses()])
      .then(([colleges, courses]) =>
        setItems(
          colleges.map((c) => {
            const own = courses.filter((x) => x.college_id === c.id);
            return { ...c, courses: own, summary: summarize(own) };
          }),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const filters = useMemo(
    () => ({
      states: options(items, (r) => [r.state || ""]),
      districts: options(items, (r) => (state === ALL || r.state === state ? [r.district] : [])),
      types: options(items, (r) => [r.college_type]),
      levels: options(items, (r) => r.summary.levels),
      streams: options(items, (r) => r.summary.streams),
      exams: options(items, (r) => r.summary.exams),
    }),
    [items, state],
  );
  const q = search.trim().toLowerCase();
  const cap = maxFee === ALL ? null : Number(maxFee);
  const shown = items
    .filter((c) => {
      // Course-level filters must all match the same course.
      const courseMatch = c.courses.some(
        (x) =>
          (level === ALL || x.level === level) &&
          (stream === ALL || x.stream?.trim() === stream) &&
          (exam === ALL || splitExams(x.entrance_exams).some((e) => e.trim() === exam)) &&
          (cap == null || (x.tuition_fee != null && x.tuition_fee <= cap)),
      );
      const courseFiltered = level !== ALL || stream !== ALL || exam !== ALL || cap != null;
      const text = [
        c.name,
        c.district,
        c.state,
        c.college_type,
        ...c.courses.map((x) => x.course_name),
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (state === ALL || c.state === state) &&
        (district === ALL || c.district === district) &&
        (type === ALL || c.college_type === type) &&
        (!courseFiltered || courseMatch)
      );
    })
    .sort((a, b) =>
      sort === "fee"
        ? (a.summary.minFee ?? Infinity) - (b.summary.minFee ?? Infinity)
        : sort === "courses"
          ? b.summary.count - a.summary.count
          : a.name.localeCompare(b.name),
    );
  const activeFilters = [state, district, type, level, stream, exam, maxFee].filter(
    (f) => f !== ALL,
  );
  function resetFilters() {
    [setState, setDistrict, setType, setLevel, setStream, setExam, setMaxFee].forEach((s) =>
      s(ALL),
    );
    setSearch("");
  }
  const select = (
    label: string,
    value: string,
    set: (v: string) => void,
    values: string[],
    all: string,
    render: (v: string) => string = (v) => v,
  ) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => set(e.target.value)}
      className="rounded-lg border bg-white px-3 py-2 text-sm"
    >
      <option value={ALL}>{all}</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {render(v)}
        </option>
      ))}
    </select>
  );
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-28 pt-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Discover your possibilities
          </p>
          <h1 className="mt-2 text-4xl font-bold text-brand-navy">Explore colleges</h1>
          <p className="mt-2 text-slate-600">
            Filter by location, course, exam and fees, then compare up to {MAX_COMPARE} colleges.
          </p>
        </div>
        <div className="mb-6 space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 rounded-lg border px-3">
            <Search className="text-slate-400" size={20} />
            <input
              aria-label="Search colleges"
              placeholder="Search by college, city, or course (e.g. B.Tech, Nursing)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-400" />
            {select(
              "Filter state",
              state,
              (v) => {
                setState(v);
                setDistrict(ALL);
              },
              filters.states,
              "All India",
            )}
            {select("Filter city", district, setDistrict, filters.districts, "All cities")}
            {select("Filter college type", type, setType, filters.types, "All types")}
            {select("Filter course level", level, setLevel, filters.levels, "All levels")}
            {select("Filter stream", stream, setStream, filters.streams, "All streams")}
            {select("Filter entrance exam", exam, setExam, filters.exams, "Any exam")}
            {select(
              "Maximum annual fee",
              maxFee,
              setMaxFee,
              FEE_CAPS.map(String),
              "Any fee",
              (v) => `Up to ₹${Number(v).toLocaleString("en-IN")}/yr`,
            )}
            {activeFilters.length > 0 && (
              <button onClick={resetFilters} className="text-sm font-semibold text-blue-700">
                Clear filters
              </button>
            )}
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            {loading ? "" : `${shown.length} college${shown.length === 1 ? "" : "s"} found`}
          </span>
          <select
            aria-label="Sort colleges"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border bg-white px-3 py-1.5"
          >
            <option value="name">Sort: Name</option>
            <option value="fee">Sort: Lowest fee</option>
            <option value="courses">Sort: Most courses</option>
          </select>
        </div>
        {notice && (
          <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            {notice}
          </p>
        )}
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {error}. Check Supabase configuration and database migration.
          </p>
        ) : loading ? (
          <p>Loading colleges…</p>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <Building2 className="mx-auto mb-3 text-blue-500" size={38} />
            <h2 className="font-bold">No colleges match these filters</h2>
            <p className="mt-2 text-slate-500">
              Try removing a filter or searching another course.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <article
                key={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
              >
                <Link to="/colleges/$id" params={{ id: c.id }}>
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={`${c.name} campus`}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-blue-100 to-emerald-50">
                      <Building2 size={56} className="text-blue-500" />
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-bold uppercase text-blue-600">
                    {c.college_type || "College"}
                  </span>
                  <Link to="/colleges/$id" params={{ id: c.id }}>
                    <h2 className="mt-1 text-xl font-bold text-brand-navy hover:text-blue-700">
                      {c.name}
                    </h2>
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={15} />
                    {[c.district, c.state].filter(Boolean).join(", ") || "Location unavailable"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <BookOpen size={15} /> {c.summary.count} courses
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <IndianRupee size={15} /> {feeRange(c.summary)}
                    </p>
                  </div>
                  {c.summary.levels.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.summary.levels.map((l) => (
                        <span
                          key={l}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={compare.has(c.id)}
                        onChange={() => {
                          setNotice(
                            compare.toggle(c.id)
                              ? ""
                              : `You can compare up to ${MAX_COMPARE} colleges. Remove one first.`,
                          );
                        }}
                      />
                      Compare
                    </label>
                    <Link
                      to="/colleges/$id"
                      params={{ id: c.id }}
                      className="font-semibold text-blue-700"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <CompareBar colleges={items} />
      <SiteFooter />
    </div>
  );
}
