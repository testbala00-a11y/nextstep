import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Building2, IndianRupee } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getColleges, fee, type College } from "@/lib/college-data";
export const Route = createFileRoute("/colleges/")({ component: Colleges });
function Colleges() {
  const [items, setItems] = useState<College[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  useEffect(() => {
    getColleges()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const districts = useMemo(
    () => Array.from(new Set(items.map((c) => c.district).filter(Boolean))).sort(),
    [items],
  );
  const shown = items.filter(
    (c) =>
      (c.name + " " + c.district + " " + c.college_type)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (district === "all" || c.district === district),
  );
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Discover your possibilities
          </p>
          <h1 className="mt-2 text-4xl font-bold text-brand-navy">Explore colleges</h1>
          <p className="mt-2 text-slate-600">
            Compare locations, study options and published fee information.
          </p>
        </div>
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row">
          <label className="flex flex-1 items-center gap-2">
            <Search className="text-slate-400" size={20} />
            <input
              aria-label="Search colleges"
              placeholder="Search by college, city, or type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </label>
          <select
            aria-label="Filter district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option value="all">All districts</option>
            {districts.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {error}. Check Supabase configuration and database migration.
          </p>
        ) : loading ? (
          <p>Loading colleges…</p>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <Building2 className="mx-auto mb-3 text-blue-500" size={38} />
            <h2 className="font-bold">No matching published colleges yet</h2>
            <p className="mt-2 text-slate-500">
              College information will appear when the admin publishes it.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <Link
                to="/colleges/$id"
                params={{ id: c.id }}
                key={c.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={`${c.name} campus`}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-100 to-emerald-50">
                    <Building2 size={60} className="text-blue-500" />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-xs font-bold uppercase text-blue-600">
                    {c.college_type || "College"}
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-brand-navy">{c.name}</h2>
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={15} />
                    {c.district || "Location unavailable"}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <IndianRupee size={16} />
                    {fee(c.annual_fee)}
                    {!c.fee_verified && c.annual_fee != null ? " (unverified)" : ""}
                  </p>
                  <p className="mt-4 font-semibold text-blue-700">View college details →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
