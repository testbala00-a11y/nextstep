import { Link } from "@tanstack/react-router";

export function Brand({ compact = false, admin = false }: { compact?: boolean; admin?: boolean }) {
  return (
    <Link
      to={admin ? "/admin" : "/"}
      aria-label={admin ? "NextStep administration" : "NextStep home"}
      className="inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
    >
      <img
        src="/favicon.png"
        width={40}
        height={40}
        alt=""
        className="size-10 shrink-0 object-contain"
      />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-lg font-bold text-brand-navy">NextStep</span>
        {!compact && (
          <span className="mt-0.5 text-[10px] font-medium text-slate-500">
            Your Future Starts Here
          </span>
        )}
      </span>
      {admin && (
        <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
          ADMIN
        </span>
      )}
    </Link>
  );
}
