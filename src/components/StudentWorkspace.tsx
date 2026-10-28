import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, ListChecks, Sparkles, Trash2 } from "lucide-react";
import { getColleges, type College } from "@/lib/college-data";
import { getSavedCollegeIds, toggleSavedCollege } from "@/lib/saved-colleges";
import {
  addChecklistItems,
  getChecklist,
  removeChecklistItem,
  setChecklistDone,
  type ChecklistItem,
} from "@/lib/checklist";
import { loadPlan } from "@/lib/plan-store";
import type { Plan } from "@/lib/next-step";

/** Plan summary, saved colleges and application checklist for a signed-in student. */
export function StudentWorkspace() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saved, setSaved] = useState<College[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  async function refresh() {
    const [p, ids, colleges, list] = await Promise.all([
      loadPlan(),
      getSavedCollegeIds(),
      getColleges(),
      getChecklist(),
    ]);
    setPlan(p);
    setSaved(colleges.filter((c) => ids?.has(c.id)));
    setItems(list);
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);
  const run = (fn: () => Promise<unknown>) =>
    fn()
      .then(refresh)
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong."));
  function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    run(() => addChecklistItems([{ title, due_date: due || null }]));
    setTitle("");
    setDue("");
  }
  const done = items.filter((i) => i.completed_at).length;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mt-10 space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
          <Sparkles size={20} className="text-emerald-600" /> Your Next Step plan
        </h2>
        {plan?.interests.length ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              {[
                plan.interests.join(", "),
                plan.level && `${plan.level} courses`,
                plan.states.length ? plan.states.join(", ") : "anywhere in India",
                plan.budget != null && `up to ₹${plan.budget.toLocaleString("en-IN")}/yr`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <Link
              to="/student/assessment"
              className="mt-3 inline-block font-semibold text-blue-700"
            >
              See my matches →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Answer 3 quick steps to get courses and colleges matched to you.
            </p>
            <Link
              to="/student/assessment"
              className="mt-3 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Plan my next step
            </Link>
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
            <Heart size={20} className="text-rose-600" /> Saved colleges ({saved.length})
          </h2>
          <ul className="mt-3 divide-y">
            {saved.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link
                    to="/colleges/$id"
                    params={{ id: c.id }}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {[c.district, c.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <button
                  aria-label={`Remove ${c.name} from saved`}
                  onClick={() => run(() => toggleSavedCollege(c.id, true))}
                  className="text-slate-400 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          {!saved.length && (
            <p className="mt-2 text-sm text-slate-500">
              Tap Save on any college page to keep it here.
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
            <ListChecks size={20} /> Application checklist
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-slate-500">
                {done}/{items.length} done
              </span>
            )}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {items.map((i) => {
              const overdue = !i.completed_at && i.due_date && i.due_date < today;
              return (
                <li key={i.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    aria-label={`Mark ${i.title} done`}
                    checked={!!i.completed_at}
                    onChange={(e) => run(() => setChecklistDone(i.id, e.target.checked))}
                  />
                  <span className={`flex-1 ${i.completed_at ? "text-slate-400 line-through" : ""}`}>
                    {i.title}
                    {i.due_date && (
                      <span
                        className={`ml-2 text-xs ${overdue ? "text-red-700" : "text-slate-500"}`}
                      >
                        {overdue ? "Overdue · " : "Due "}
                        {new Date(i.due_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </span>
                  <button
                    aria-label={`Delete ${i.title}`}
                    onClick={() => run(() => removeChecklistItem(i.id))}
                    className="text-slate-400 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
          <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
            <input
              aria-label="New checklist item"
              placeholder="Add a task, e.g. Pay JEE fee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              aria-label="Due date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="rounded-lg border px-2 py-2 text-sm"
            />
            <button className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
