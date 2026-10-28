import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Edit2, Trash2, ImagePlus, Save, X, Building2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGate, useAdminAccess } from "@/components/AdminGate";
import {
  getColleges,
  getCollegeCourses,
  externalUrl,
  type College,
  type CollegeCourse,
} from "@/lib/college-data";
export const Route = createFileRoute("/admin/colleges")({ component: Page });
const blank = {
  name: "",
  district: "",
  college_type: "",
  address: "",
  description: "",
  annual_fee: "",
  fee_source_url: "",
  source_url: "",
  image_url: "",
  status: "draft" as College["status"],
};
const LEVELS = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
type CourseRow = {
  key: string;
  id?: string;
  course_name: string;
  level: string;
  stream: string;
  duration: string;
  seats: string;
  tuition_fee: string;
  eligibility: string;
  entrance_exams: string;
  fee_notes: string;
};
const blankCourse = (): CourseRow => ({
  key: crypto.randomUUID(),
  course_name: "",
  level: "UG",
  stream: "",
  duration: "",
  seats: "",
  tuition_fee: "",
  eligibility: "",
  entrance_exams: "",
  fee_notes: "",
});
const toRow = (c: CollegeCourse): CourseRow => ({
  key: c.id,
  id: c.id,
  course_name: c.course_name,
  level: c.level || "",
  stream: c.stream || "",
  duration: c.duration || "",
  seats: c.seats?.toString() || "",
  tuition_fee: c.tuition_fee?.toString() || "",
  eligibility: c.eligibility || "",
  entrance_exams: c.entrance_exams || "",
  fee_notes: c.fee_notes || "",
});
function optionalNumber(v: string, label: string) {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a non-negative number.`);
  return n;
}
const courseFields = [
  ["stream", "Stream", "Engineering", "text"],
  ["duration", "Duration", "4 years", "text"],
  ["seats", "Seats", "120", "number"],
  ["tuition_fee", "Annual fee (INR)", "150000", "number"],
  ["entrance_exams", "Entrance exams", "JEE Main, TNEA", "text"],
  ["eligibility", "Eligibility", "10+2 PCM, 60%", "text"],
  ["fee_notes", "Fee notes", "Excludes hostel", "text"],
] as const;
function Page() {
  return (
    <AdminGate>
      <Colleges />
    </AdminGate>
  );
}
function Colleges() {
  const { isSuperAdmin, userId } = useAdminAccess();
  const [items, setItems] = useState<College[]>([]);
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ ...blank });
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loadedCourseIds, setLoadedCourseIds] = useState<string[]>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  async function refresh() {
    const [colleges, rows] = await Promise.all([getColleges(true), getCollegeCourses()]);
    setItems(colleges);
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.college_id] = (counts[r.college_id] || 0) + 1;
    setCourseCounts(counts);
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);
  function update(k: keyof typeof blank, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }
  function updateCourse(key: string, k: keyof CourseRow, v: string) {
    setCourses((rows) => rows.map((r) => (r.key === key ? { ...r, [k]: v } : r)));
  }
  function reset() {
    setForm({ ...blank });
    setCourses([]);
    setLoadedCourseIds([]);
    setEdit(null);
    setOpen(false);
  }
  async function start(c: College) {
    setEdit(c.id);
    setForm({
      name: c.name,
      district: c.district,
      college_type: c.college_type,
      address: c.address || "",
      description: c.description,
      annual_fee: c.annual_fee?.toString() || "",
      fee_source_url: c.fee_source_url || "",
      source_url: c.source_url || "",
      image_url: c.image_url || "",
      status: c.status,
    });
    setCourses([]);
    setLoadedCourseIds([]);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const rows = await getCollegeCourses(c.id);
      setCourses(rows.map(toRow));
      setLoadedCourseIds(rows.map((r) => r.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load courses");
    }
  }
  async function upload(file: File) {
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Upload a JPG, PNG or WebP under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `colleges/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("college-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("college-images").getPublicUrl(path);
      update("image_url", data.publicUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Apply the storage migration first.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const source = externalUrl(form.source_url);
      if (form.status === "published" && !source)
        throw new Error("Publishing requires a valid official source URL.");
      if (form.fee_source_url && !externalUrl(form.fee_source_url))
        throw new Error("Fee source must be a valid HTTP(S) URL.");
      if (form.image_url && !externalUrl(form.image_url))
        throw new Error("Image URL must be a valid HTTP(S) URL.");
      const payload = {
        name: form.name.trim(),
        district: form.district.trim(),
        college_type: form.college_type.trim(),
        address: form.address.trim() || null,
        description: form.description.trim(),
        annual_fee: optionalNumber(form.annual_fee, "Fees"),
        source_url: source || null,
        fee_source_url: externalUrl(form.fee_source_url) || null,
        image_url: externalUrl(form.image_url) || null,
        status: form.status,
        fee_verified: false,
        last_verified_at: form.status === "published" ? new Date().toISOString() : null,
        updated_by: userId,
      };
      const filled = courses.filter((c) => c.course_name.trim());
      const names = filled.map((c) => c.course_name.trim().toLowerCase());
      const dup = names.find((n, i) => names.indexOf(n) !== i);
      if (dup) throw new Error(`Course "${dup}" is listed twice.`);
      const rows = filled.map((c, i) => ({
        id: c.id,
        values: {
          course_name: c.course_name.trim(),
          level: c.level || null,
          stream: c.stream.trim() || null,
          duration: c.duration.trim() || null,
          seats: optionalNumber(c.seats, `Seats for ${c.course_name}`),
          tuition_fee: optionalNumber(c.tuition_fee, `Fee for ${c.course_name}`),
          eligibility: c.eligibility.trim() || null,
          entrance_exams: c.entrance_exams.trim() || null,
          fee_notes: c.fee_notes.trim() || null,
          sort_order: i,
        },
      }));
      let collegeId = edit;
      if (edit) {
        const { error } = await supabase.from("colleges").update(payload).eq("id", edit);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("colleges")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        collegeId = data.id;
      }
      const keep = new Set(rows.flatMap((r) => (r.id ? [r.id] : [])));
      const removed = loadedCourseIds.filter((id) => !keep.has(id));
      if (removed.length) {
        const { error } = await supabase.from("college_courses").delete().in("id", removed);
        if (error) throw error;
      }
      for (const r of rows.filter((r) => r.id)) {
        const { error } = await supabase.from("college_courses").update(r.values).eq("id", r.id!);
        if (error) throw error;
      }
      const added = rows.filter((r) => !r.id);
      if (added.length) {
        const { error } = await supabase
          .from("college_courses")
          .insert(added.map((r) => ({ ...r.values, college_id: collegeId! })));
        if (error) throw error;
      }
      await refresh();
      setNotice(
        `${edit ? "College updated" : "College added"} with ${filled.length} course${filled.length === 1 ? "" : "s"}.`,
      );
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save college");
    } finally {
      setBusy(false);
    }
  }
  async function remove(c: College) {
    if (!window.confirm(`Delete ${c.name}? This also removes all of its courses.`)) return;
    setError("");
    const { error } = await supabase.from("colleges").delete().eq("id", c.id);
    if (error) setError(error.message);
    else refresh().catch((e) => setError(e.message));
  }
  const filledCount = courses.filter((c) => c.course_name.trim()).length;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Manage colleges</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add colleges together with the courses they offer.
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setCourses([blankCourse()]);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white"
        >
          <Plus size={18} /> Add college
        </button>
      </div>
      {notice && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-emerald-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      {open && (
        <form onSubmit={save} className="mb-8 space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">{edit ? "Edit college" : "Add a new college"}</h2>
            <button type="button" aria-label="Close" onClick={reset}>
              <X />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["name", "College name *"],
                ["district", "District / city"],
                ["college_type", "College type"],
                ["address", "Street address"],
                ["annual_fee", "Indicative annual fees (INR)"],
                ["source_url", "Official college source URL *"],
                ["fee_source_url", "Fee source URL"],
                ["image_url", "College image URL (optional)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <input
                  required={key === "name" || (key === "source_url" && form.status === "published")}
                  type={key === "annual_fee" ? "number" : "text"}
                  min={key === "annual_fee" ? 0 : undefined}
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2.5"
                />
              </label>
            ))}
          </div>
          <label className="block text-sm font-medium">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>
          <fieldset className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <legend className="flex items-center gap-2 px-1 font-bold text-brand-navy">
              <BookOpen size={18} /> Courses offered ({filledCount})
            </legend>
            <div className="space-y-3">
              {courses.map((c, i) => (
                <div key={c.key} className="rounded-lg border bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Course {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCourses((rows) => rows.filter((r) => r.key !== c.key))}
                      className="text-red-700"
                      aria-label={`Remove course ${i + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block text-xs font-medium sm:col-span-2">
                      Course name *
                      <input
                        required
                        placeholder="B.Tech Computer Science"
                        value={c.course_name}
                        onChange={(e) => updateCourse(c.key, "course_name", e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                      />
                    </label>
                    <label className="block text-xs font-medium">
                      Level
                      <select
                        value={c.level}
                        onChange={(e) => updateCourse(c.key, "level", e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                      >
                        <option value="">—</option>
                        {LEVELS.map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </label>
                    {courseFields.map(([k, label, ph, type]) => (
                      <label key={k} className="block text-xs font-medium">
                        {label}
                        <input
                          type={type}
                          min={type === "number" ? 0 : undefined}
                          placeholder={ph}
                          value={c[k]}
                          onChange={(e) => updateCourse(c.key, k, e.target.value)}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCourses((rows) => [...rows, blankCourse()])}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-blue-400 bg-white px-4 py-2 text-sm font-semibold text-blue-700"
              >
                <Plus size={16} /> Add course
              </button>
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-4">
            <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold">
              <ImagePlus size={17} className="mr-2 inline" />
              {uploading ? "Uploading…" : "Upload campus image"}
              <input
                type="file"
                className="sr-only"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
            </label>
            {form.image_url && (
              <img
                src={form.image_url}
                alt="College preview"
                className="h-20 w-32 rounded-lg object-cover"
              />
            )}
            <select
              aria-label="Publication status"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Only published colleges (and their courses) appear publicly.
          </p>
          <button
            disabled={busy || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50"
          >
            <Save size={17} />
            {busy ? "Saving…" : "Save college"}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {items.map((c) => (
          <article
            key={c.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4"
          >
            <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
              {c.image_url ? (
                <img className="h-full w-full object-cover" src={c.image_url} alt="" />
              ) : (
                <Building2 className="text-blue-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold">{c.name}</h2>
              <p className="text-sm text-slate-500">
                {[c.district, c.college_type, c.status].filter(Boolean).join(" · ")} ·{" "}
                {courseCounts[c.id] || 0} course{courseCounts[c.id] === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => start(c)}
              className="rounded-lg border p-2 text-blue-700"
              aria-label={`Edit ${c.name}`}
            >
              <Edit2 size={18} />
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => remove(c)}
                className="rounded-lg border p-2 text-red-700"
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 size={18} />
              </button>
            )}
          </article>
        ))}
        {!items.length && (
          <p className="rounded-xl border bg-white p-8 text-center text-slate-500">
            No colleges added yet. Click Add college to create your first listing.
          </p>
        )}
      </div>
    </>
  );
}
