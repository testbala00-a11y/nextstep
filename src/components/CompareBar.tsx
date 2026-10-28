import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCompare, MAX_COMPARE } from "@/lib/compare";
import type { College } from "@/lib/college-data";

/** Sticky bar listing colleges picked for comparison. */
export function CompareBar({ colleges }: { colleges: Pick<College, "id" | "name">[] }) {
  const compare = useCompare();
  if (!compare.ids.length) return null;
  const name = (id: string) => colleges.find((c) => c.id === id)?.name || "College";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-brand-navy">
          Compare ({compare.ids.length}/{MAX_COMPARE})
        </span>
        {compare.ids.map((id) => (
          <span
            key={id}
            className="inline-flex max-w-[14rem] items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
          >
            <span className="truncate">{name(id)}</span>
            <button aria-label={`Remove ${name(id)}`} onClick={() => compare.toggle(id)}>
              <X size={14} />
            </button>
          </span>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={compare.clear} className="rounded-lg border px-3 py-2 text-sm">
            Clear
          </button>
          <Link
            to="/colleges/compare"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              compare.ids.length < 2 ? "pointer-events-none bg-slate-400" : "bg-blue-700"
            }`}
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
