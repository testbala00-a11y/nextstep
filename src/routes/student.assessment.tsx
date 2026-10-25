import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
export const Route = createFileRoute("/student/assessment")({ component: Page });
const areas = [
  {
    name: "Technology",
    text: "Coding, machines, electronics and solving technical problems",
    courses: ["Computer Science", "Information Technology", "Electronics Engineering"],
  },
  {
    name: "Health & Life Sciences",
    text: "Human biology, care, research and laboratory work",
    courses: ["Biotechnology", "Nursing", "Life Sciences"],
  },
  {
    name: "Business & Commerce",
    text: "Entrepreneurship, finance and management",
    courses: ["Commerce", "Business Administration", "Economics"],
  },
  {
    name: "Arts & Design",
    text: "Visual creativity, communication and making things",
    courses: ["Design", "Fine Arts", "Media Studies"],
  },
  {
    name: "Public Service",
    text: "Society, policy, law and community impact",
    courses: ["Law", "Public Administration", "Social Work"],
  },
];
function Page() {
  const [chosen, setChosen] = useState<string[]>([]);
  function toggle(s: string) {
    setChosen((x) => (x.includes(s) ? x.filter((v) => v !== s) : [...x, s]));
  }
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12">
        <p className="font-semibold text-emerald-700">Career discovery</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-navy">What excites you?</h1>
        <p className="mt-3 text-slate-500">
          Pick up to three interests. This is an exploration tool, not a psychometric assessment or
          AI diagnosis.
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {areas.map((a) => (
            <button
              key={a.name}
              aria-pressed={chosen.includes(a.name)}
              onClick={() => toggle(a.name)}
              disabled={!chosen.includes(a.name) && chosen.length === 3}
              className={`rounded-2xl border p-5 text-left disabled:opacity-40 ${chosen.includes(a.name) ? "border-blue-600 bg-blue-50" : "bg-white"}`}
            >
              <h2 className="font-bold">{a.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{a.text}</p>
            </button>
          ))}
        </div>
        {chosen.length > 0 && (
          <section className="mt-8 rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold">Your study ideas</h2>
            <p className="my-2 text-sm text-slate-500">
              Based on the interests you selected, consider exploring:
            </p>
            <div className="flex flex-wrap gap-2">
              {chosen
                .flatMap((x) => areas.find((a) => a.name === x)?.courses || [])
                .map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                  >
                    {s}
                  </span>
                ))}
            </div>
            <Link to="/courses" className="mt-5 inline-block font-semibold text-blue-700">
              Browse available courses →
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
