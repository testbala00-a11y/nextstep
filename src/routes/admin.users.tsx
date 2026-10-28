import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/users")({ component: Page });

type UserRow = Database["public"]["Functions"]["list_nextstep_users"]["Returns"][number];
const date = (s: string | null) =>
  s
    ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function Page() {
  return (
    <AdminGate superAdminOnly>
      <Users />
    </AdminGate>
  );
}

function Users() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    supabase
      .rpc("list_nextstep_users")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data || []);
      })
      .then(() => setLoading(false));
  }, []);
  const needle = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (type === "all" || (type === "incomplete" ? !r.phone : r.user_type === type)) &&
      (!needle || [r.full_name, r.email, r.phone].join(" ").toLowerCase().includes(needle)),
  );
  function exportCsv() {
    const cell = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      ["Name", "Email", "Phone", "Type", "Sign-in", "Signed up", "Last sign-in"].join(","),
      ...shown.map((r) =>
        [
          r.full_name,
          r.email,
          r.phone,
          r.user_type,
          r.sign_in_method,
          r.signed_up_at,
          r.last_sign_in_at,
        ]
          .map(cell)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "nextstep-users.csv",
    });
    a.click();
    URL.revokeObjectURL(url);
  }
  const count = (t: string) => rows.filter((r) => r.user_type === t).length;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Students &amp; parents</h1>
          <p className="mt-1 text-sm text-slate-500">
            Contact details of everyone who signed up. Only you (super admin) can see this page.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!shown.length}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          ["Total", rows.length],
          ["Students", count("student")],
          ["Parents", count("parent")],
        ].map(([label, n]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-brand-navy">{n}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-white px-3">
          <Search size={18} className="text-slate-400" />
          <input
            aria-label="Search users"
            placeholder="Search name, email or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full py-2 outline-none"
          />
        </label>
        <select
          aria-label="Filter user type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2"
        >
          <option value="all">Everyone</option>
          <option value="student">Students</option>
          <option value="parent">Parents</option>
          <option value="incomplete">Details not filled</option>
        </select>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Type</th>
              <th className="p-3">Sign-in</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.user_id} className="border-t">
                <td className="p-3 font-semibold">{r.full_name || "—"}</td>
                <td className="p-3">
                  <a href={`mailto:${r.email}`} className="text-blue-700 hover:underline">
                    {r.email}
                  </a>
                </td>
                <td className="p-3">
                  {r.phone ? (
                    <a href={`tel:${r.phone}`} className="text-blue-700 hover:underline">
                      {r.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not given</span>
                  )}
                </td>
                <td className="p-3 capitalize">{r.user_type || "—"}</td>
                <td className="p-3 capitalize">{r.sign_in_method}</td>
                <td className="p-3">{date(r.signed_up_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !shown.length && !error && (
          <p className="p-6 text-center text-slate-500">No users found.</p>
        )}
        {loading && <p className="p-6 text-center text-slate-500">Loading…</p>}
      </div>
    </>
  );
}
