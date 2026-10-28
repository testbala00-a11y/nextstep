import { useSyncExternalStore } from "react";

// Compare list lives in this browser only; up to three colleges at a time.
const KEY = "nextstep-compare";
export const MAX_COMPARE = 3;
const listeners = new Set<() => void>();
let current: string[] = read();

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}
function write(ids: string[]) {
  current = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable; keep in memory
  }
  listeners.forEach((l) => l());
}
const EMPTY: string[] = [];
export function useCompare() {
  const ids = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => EMPTY,
  );
  return {
    ids,
    has: (id: string) => ids.includes(id),
    /** Returns false when the list is already full. */
    toggle(id: string) {
      if (ids.includes(id)) write(ids.filter((x) => x !== id));
      else if (ids.length >= MAX_COMPARE) return false;
      else write([...ids, id]);
      return true;
    },
    clear: () => write([]),
  };
}
