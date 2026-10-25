import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  getColleges,
  getCourses,
  getOfferings,
  fee,
  type College,
  type Course,
  type Offering,
} from "@/lib/college-data";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
export const Route = createFileRoute("/admin/offerings")({ component: Page });
function Page() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [offers, setOffers] = useState<Offering[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const [a, b, c] = await Promise.all([getColleges(true), getCourses(true), getOfferings()]);
    setColleges(a);
    setCourses(b);
    setOffers(c);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const tuitionFee = amount === "" ? null : Number(amount);
      if (tuitionFee !== null && (!Number.isFinite(tuitionFee) || tuitionFee < 0)) {
        throw new Error("Fees must be a non-negative number.");
      }
      const { error } = await supabase.from("college_courses").upsert(
        {
          college_id: collegeId,
          course_id: courseId,
          tuition_fee: tuitionFee,
          fee_notes: notes.trim() || null,
        },
        { onConflict: "college_id,course_id" },
      );
      if (error) throw error;
      else {
        await load();
        setAmount("");
        setNotes("");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save college course and fees.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(o: Offering) {
    if (!window.confirm("Remove this course from the college?")) return;
    const { error } = await supabase.from("college_courses").delete().eq("id", o.id);
    if (error) setError(error.message);
    else load().catch((e) => setError(e.message));
  }
  return (
    <AdminGate>
      <h1 className="text-3xl font-bold text-brand-navy">College courses & fees</h1>
      <p className="mb-6 mt-2 text-slate-500">
        Assign courses to a college and set the per-course annual tuition fee.
      </p>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={add} className="mb-7 grid gap-3 rounded-xl border bg-white p-5">
        <label>
          College
          <select
            required
            className="mt-1 w-full rounded-lg border p-3"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
          >
            <option value="">Choose a college</option>
            {colleges.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Course
          <select
            required
            className="mt-1 w-full rounded-lg border p-3"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Choose a course</option>
            {courses.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Annual tuition fee in INR
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border p-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Leave blank if unknown"
          />
        </label>
        <label>
          Fee notes
          <input
            className="mt-1 w-full rounded-lg border p-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Tuition only; excludes hostel"
          />
        </label>
        <button disabled={busy} className="rounded-lg bg-blue-700 p-3 font-bold text-white">
          {busy ? "Saving…" : "Save college course & fees"}
        </button>
      </form>
      {offers.map((o) => (
        <div
          key={o.id}
          className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-white p-4"
        >
          <div>
            <strong>
              {colleges.find((c) => c.id === o.college_id)?.name || "Unknown college"}
            </strong>
            <p className="text-sm text-slate-500">
              {courses.find((c) => c.id === o.course_id)?.name || "Unknown course"} ·{" "}
              {fee(o.tuition_fee)}
            </p>
            {o.fee_notes && <p className="text-xs text-slate-500">{o.fee_notes}</p>}
          </div>
          <button aria-label="Remove offering" onClick={() => remove(o)}>
            <Trash2 className="text-red-700" />
          </button>
        </div>
      ))}
    </AdminGate>
  );
}
