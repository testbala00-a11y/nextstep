import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getColleges, getCollegeCourses, type CollegeCourse } from "@/lib/college-data";
export const Route = createFileRoute("/courses/")({ component: Courses });
type CourseGroup = {
  name: string;
  level: string | null;
  stream: string | null;
  duration: string | null;
  colleges: { id: string; name: string }[];
};
// Courses are entered per college; group identical names so each course lists its colleges.
function groupCourses(rows: CollegeCourse[], names: Map<string, string>) {
  const groups = new Map<string, CourseGroup>();
  for (const r of rows) {
    const college = names.get(r.college_id);
    if (!college) continue;
    const key = r.course_name.trim().toLowerCase();
    const g = groups.get(key) ?? {
      name: r.course_name,
      level: r.level,
      stream: r.stream,
      duration: r.duration,
      colleges: [],
    };
    g.colleges.push({ id: r.college_id, name: college });
    groups.set(key, g);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function Courses() {
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getColleges(), getCollegeCourses()])
      .then(([colleges, rows]) =>
        setCourses(groupCourses(rows, new Map(colleges.map((c) => [c.id, c.name])))),
      )
      .catch((e) => setError(e.message));
  }, []);
  const needle = q.toLowerCase();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <p className="font-semibold text-emerald-700">Find your study path</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-navy">Explore courses</h1>
        <div className="my-8 flex max-w-xl items-center gap-2 rounded-xl border bg-white p-3">
          <Search size={20} />
          <input
            aria-label="Search courses"
            className="w-full outline-none"
            placeholder="Search degree or subject"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {courses
            .filter((c) => [c.name, c.stream, c.level].join(" ").toLowerCase().includes(needle))
            .map((c) => (
              <article key={c.name} className="rounded-xl border bg-white p-6">
                <BookOpen className="mb-3 text-blue-700" />
                <h2 className="text-xl font-bold">{c.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {[c.level, c.stream, c.duration].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-4 text-sm font-semibold">
                  Offered at {c.colleges.length} college{c.colleges.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {c.colleges.slice(0, 5).map((col) => (
                    <li key={col.id}>
                      <Link
                        to="/colleges/$id"
                        params={{ id: col.id }}
                        className="text-blue-700 hover:underline"
                      >
                        {col.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
        {!error && courses.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-slate-600">
            No published courses yet. Admins add courses inside each college.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
