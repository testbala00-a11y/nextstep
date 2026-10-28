import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CompareBar } from "@/components/CompareBar";
import { useCompare } from "@/lib/compare";
import {
  getColleges,
  getCollegeCourses,
  fee,
  INDIAN_STATES,
  type College,
  type CollegeCourse,
} from "@/lib/college-data";
import {
  AREAS,
  BACKGROUNDS,
  matchCourses,
  suggestSteps,
  type AreaName,
  type Plan,
} from "@/lib/next-step";
import { emptyPlan, loadPlan, savePlan } from "@/lib/plan-store";
import { addChecklistItems } from "@/lib/checklist";
export const Route = createFileRoute("/student/assessment")({ component: Page });
const STEPS = ["Interests", "Background", "Preferences", "Your plan"];
const LEVELS = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const BUDGETS = [50000, 100000, 200000, 300000, 500000];
const COMMON_EXAMS = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "CUET",
  "CLAT",
  "CAT",
  "NATA",
  "UCEED",
  "State CET",
];
function Page() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<CollegeCourse[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [examInput, setExamInput] = useState("");
  const compare = useCompare();
  useEffect(() => {
    loadPlan()
      .then((p) => p && setPlan(p))
      .catch(() => undefined);
    Promise.all([getColleges(), getCollegeCourses()])
      .then(([cc, co]) => {
        setColleges(cc);
        setCourses(co);
      })
      .catch((e) => setError(e.message));
  }, []);
  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setPlan((p) => ({ ...p, [k]: v }));
  const toggleIn = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  const matches = useMemo(() => matchCourses(plan, colleges, courses), [plan, colleges, courses]);
  const strong = matches.filter((m) => m.score > 0);
  const shown = (showAll ? matches : strong).slice(0, showAll ? 40 : 12);
  const steps = suggestSteps(plan, strong);
  const areas = AREAS.filter((a) => plan.interests.includes(a.name));
  async function finish() {
    setStep(3);
    setNotice("");
    try {
      const synced = await savePlan(plan);
      if (!synced) setNotice("Sign in to keep this plan on your account and build a checklist.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save your plan.");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function addSteps() {
    try {
      const added = await addChecklistItems(steps.map((title) => ({ title })));
      setNotice(
        added === null
          ? "Sign in as a student to save a checklist."
          : added
            ? `Added ${added} step${added === 1 ? "" : "s"} to your checklist on the dashboard.`
            : "These steps are already on your checklist.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not add steps.");
    }
  }
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm ${active ? "border-blue-700 bg-blue-700 text-white" : "bg-white hover:border-blue-300"}`;
  const canNext = step === 0 ? plan.interests.length > 0 : step === 1 ? !!plan.background : true;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-28 pt-10">
        <p className="font-semibold text-emerald-700">Plan your next step</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-navy sm:text-4xl">
          {step === 3 ? "Your Next Step plan" : "Find courses and colleges that fit you"}
        </h1>
        <ol className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                i === step
                  ? "bg-blue-700 text-white"
                  : i < step
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-white text-slate-500"
              }`}
            >
              {i < step ? <Check size={14} /> : <span>{i + 1}.</span>} {s}
            </li>
          ))}
        </ol>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        {step === 0 && (
          <section className="mt-7">
            <p className="text-slate-600">Pick up to three areas that excite you.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {AREAS.map((a) => {
                const on = plan.interests.includes(a.name);
                return (
                  <button
                    key={a.name}
                    aria-pressed={on}
                    onClick={() => set("interests", toggleIn<AreaName>(plan.interests, a.name))}
                    disabled={!on && plan.interests.length === 3}
                    className={`rounded-2xl border p-5 text-left disabled:opacity-40 ${on ? "border-blue-600 bg-blue-50" : "bg-white"}`}
                  >
                    <h2 className="font-bold">{a.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{a.text}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="mt-7 space-y-6">
            <div>
              <h2 className="font-bold">What are you studying now (or just finished)?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b}
                    className={chip(plan.background === b)}
                    onClick={() => set("background", b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-bold">Which level are you looking for?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    className={chip(plan.level === l)}
                    onClick={() => set("level", plan.level === l ? "" : l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-7 space-y-6">
            <div>
              <h2 className="font-bold">Where would you like to study?</h2>
              <p className="text-sm text-slate-500">
                Pick states, or leave empty for anywhere in India.
              </p>
              <select
                aria-label="Add a state"
                value=""
                onChange={(e) =>
                  e.target.value && set("states", toggleIn(plan.states, e.target.value))
                }
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2.5 sm:w-80"
              >
                <option value="">+ Add a state</option>
                {INDIAN_STATES.filter((s) => !plan.states.includes(s)).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                {plan.states.map((s) => (
                  <button
                    key={s}
                    className={chip(true)}
                    onClick={() => set("states", toggleIn(plan.states, s))}
                  >
                    {s} ✕
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-bold">Annual fee budget</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    className={chip(plan.budget === b)}
                    onClick={() => set("budget", plan.budget === b ? null : b)}
                  >
                    Up to ₹{b.toLocaleString("en-IN")}
                  </button>
                ))}
                <button className={chip(plan.budget == null)} onClick={() => set("budget", null)}>
                  No limit
                </button>
              </div>
            </div>
            <div>
              <h2 className="font-bold">Entrance exams you have taken or plan to take</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...new Set([...COMMON_EXAMS, ...plan.exams])].map((e) => (
                  <button
                    key={e}
                    className={chip(plan.exams.includes(e))}
                    onClick={() => set("exams", toggleIn(plan.exams, e))}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  const v = examInput.trim();
                  if (v && !plan.exams.includes(v)) set("exams", [...plan.exams, v]);
                  setExamInput("");
                }}
              >
                <input
                  aria-label="Other exam"
                  placeholder="Other exam (e.g. TNEA)"
                  value={examInput}
                  onChange={(e) => setExamInput(e.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                />
                <button className="rounded-lg border bg-white px-3 text-sm">Add</button>
              </form>
            </div>
          </section>
        )}

        {step < 3 && (
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 font-semibold disabled:invisible"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
              disabled={!canNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {step === 2 ? "Show my plan" : "Next"} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <section className="mt-6 space-y-8">
            {notice && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>
            )}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
                <Sparkles size={20} className="text-emerald-600" /> Careers to explore
              </h2>
              <div className="mt-3 space-y-2">
                {areas.map((a) => (
                  <p key={a.name} className="text-sm">
                    <strong>{a.name}:</strong> {a.careers.join(", ")}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setStep(0)}
                className="mt-4 text-sm font-semibold text-blue-700"
              >
                Change my answers
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                Courses and colleges for you ({strong.length})
              </h2>
              <p className="text-sm text-slate-500">
                Ranked by how well each course fits your interests, level, location, budget and
                exams.
              </p>
              <div className="mt-4 space-y-3">
                {shown.map((m) => (
                  <article key={m.course.id} className="rounded-xl border bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{m.course.course_name}</h3>
                        <Link
                          to="/colleges/$id"
                          params={{ id: m.college.id }}
                          className="text-sm font-semibold text-blue-700 hover:underline"
                        >
                          {m.college.name}
                        </Link>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} />
                          {[m.college.district, m.college.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <strong className="text-sm">{fee(m.course.tuition_fee)}</strong>
                        <label className="mt-1 flex items-center justify-end gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={compare.has(m.college.id)}
                            onChange={() => compare.toggle(m.college.id)}
                          />
                          Compare college
                        </label>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {m.reasons.map((r) => (
                        <li
                          key={r}
                          className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800"
                        >
                          ✓ {r}
                        </li>
                      ))}
                      {m.cautions.map((r) => (
                        <li
                          key={r}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800"
                        >
                          <AlertTriangle size={11} /> {r}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
                {!colleges.length && !error && <p className="text-slate-500">Loading colleges…</p>}
                {colleges.length > 0 && shown.length === 0 && (
                  <p className="rounded-xl border bg-white p-5 text-slate-500">
                    No published courses match yet. Try widening your location or budget.
                  </p>
                )}
              </div>
              {!showAll && matches.length > strong.length && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-3 text-sm font-semibold text-blue-700"
                >
                  Also show courses outside my budget or location →
                </button>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
                <ListChecks size={20} /> Your next steps
              </h2>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <button
                onClick={addSteps}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Add to my checklist
              </button>
            </div>
            <p className="text-xs text-slate-500">
              This is a guidance tool based on the information colleges have published on NextStep,
              not a guarantee of admission. Always confirm details with the college.
            </p>
          </section>
        )}
      </main>
      <CompareBar colleges={colleges} />
      <SiteFooter />
    </div>
  );
}
