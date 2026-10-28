import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Building2, ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  getColleges,
  getCollegeCourses,
  fee,
  externalUrl,
  type College,
  type CollegeCourse,
} from "@/lib/college-data";
export const Route = createFileRoute("/colleges/$id")({ component: Detail });
function Detail() {
  const { id } = Route.useParams();
  const [college, setCollege] = useState<College | null>(null);
  const [courses, setCourses] = useState<CollegeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getColleges(), getCollegeCourses(id)])
      .then(([cc, co]) => {
        setCollege(cc.find((x) => x.id === id) || null);
        setCourses(co);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  const link = externalUrl(college?.source_url);
  const groups = courses.reduce<Record<string, CollegeCourse[]>>((acc, c) => {
    (acc[c.level || "Other"] ||= []).push(c);
    return acc;
  }, {});
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
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
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center bg-blue-100">
                  <Building2 size={70} className="text-blue-500" />
                </div>
              )}
              <div className="p-7">
                <span className="text-xs font-bold uppercase text-emerald-700">
                  {college.college_type || "College"}
                </span>
                <h1 className="mt-2 text-3xl font-bold text-brand-navy">{college.name}</h1>
                <p className="mt-2 flex gap-2 text-slate-600">
                  <MapPin size={18} />
                  {[college.address, college.district].filter(Boolean).join(", ")}
                </p>
                <p className="mt-6 whitespace-pre-wrap text-slate-700">
                  {college.description || "Description coming soon."}
                </p>
                <div className="mt-6 grid gap-4 rounded-2xl bg-blue-50 p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Indicative annual fees</p>
                    <p className="mt-1 font-bold">{fee(college.annual_fee)}</p>
                    <p className="text-xs text-slate-500">
                      {college.fee_verified
                        ? "Admin marked fee as verified"
                        : "Fees not independently verified"}
                    </p>
                  </div>
                  <div>
                    {link && (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={link}
                        className="font-semibold text-blue-700 underline"
                      >
                        Official college source ↗
                      </a>
                    )}
                    {externalUrl(college.fee_source_url) && (
                      <p>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={externalUrl(college.fee_source_url)}
                          className="text-sm text-blue-700 underline"
                        >
                          Fee information source ↗
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <section className="mt-9">
              <h2 className="mb-4 text-2xl font-bold text-brand-navy">Courses and fees</h2>
              <div className="space-y-6">
                {Object.entries(groups).map(([level, list]) => (
                  <div key={level}>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                      {level} · {list.length} course{list.length === 1 ? "" : "s"}
                    </h3>
                    <div className="space-y-3">
                      {list.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border bg-white p-5 sm:flex sm:items-start sm:justify-between sm:gap-6"
                        >
                          <div>
                            <h4 className="font-bold">{c.course_name}</h4>
                            <p className="text-sm text-slate-500">
                              {[c.stream, c.duration, c.seats != null && `${c.seats} seats`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {c.eligibility && (
                              <p className="mt-1 text-sm">
                                <strong>Eligibility:</strong> {c.eligibility}
                              </p>
                            )}
                            {c.entrance_exams && (
                              <p className="text-sm">
                                <strong>Exams accepted:</strong> {c.entrance_exams}
                              </p>
                            )}
                            {c.fee_notes && (
                              <p className="mt-1 text-xs text-slate-500">{c.fee_notes}</p>
                            )}
                          </div>
                          <strong className="mt-2 block shrink-0 sm:mt-0">
                            {fee(c.tuition_fee)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <p className="rounded-xl border bg-white p-5 text-slate-500">
                    No courses listed yet.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
