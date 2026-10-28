import { splitExams, type College, type CollegeCourse } from "@/lib/college-data";

/** Interest areas shown in the quiz; keywords are matched against course names and streams. */
export const AREAS = [
  {
    name: "Technology",
    text: "Coding, machines, electronics and solving technical problems",
    careers: [
      "Software Engineer",
      "Data Analyst",
      "Electronics Engineer",
      "Cyber Security Analyst",
    ],
    keywords: [
      "tech",
      "engineering",
      "computer",
      "cse",
      "information",
      "electronic",
      "ece",
      "electrical",
      "mechanical",
      "civil",
      "bca",
      "mca",
      "data",
      "ai",
      "software",
      "robot",
    ],
    streams: ["Science (PCM)"],
  },
  {
    name: "Health & Life Sciences",
    text: "Human biology, care, research and laboratory work",
    careers: ["Doctor", "Nurse", "Pharmacist", "Biotechnologist", "Physiotherapist"],
    keywords: [
      "mbbs",
      "medical",
      "medicine",
      "nursing",
      "pharm",
      "bio",
      "life science",
      "physio",
      "bds",
      "dental",
      "health",
      "paramedical",
      "bams",
      "bhms",
      "zoology",
      "botany",
      "microbio",
    ],
    streams: ["Science (PCB)"],
  },
  {
    name: "Business & Commerce",
    text: "Entrepreneurship, finance and management",
    careers: ["Chartered Accountant", "Business Analyst", "Marketing Manager", "Banker"],
    keywords: [
      "commerce",
      "b.com",
      "bcom",
      "m.com",
      "bba",
      "mba",
      "management",
      "business",
      "finance",
      "account",
      "economics",
      "pgdm",
      "bms",
    ],
    streams: ["Commerce", "Science (PCM)", "Science (PCB)", "Arts / Humanities"],
  },
  {
    name: "Arts & Design",
    text: "Visual creativity, communication and making things",
    careers: ["Designer", "Architect", "Journalist", "Animator", "Content Creator"],
    keywords: [
      "design",
      "b.des",
      "fine arts",
      "bfa",
      "media",
      "journalism",
      "mass comm",
      "animation",
      "architecture",
      "b.arch",
      "fashion",
      "film",
      "visual",
    ],
    streams: ["Arts / Humanities", "Commerce", "Science (PCM)", "Science (PCB)"],
  },
  {
    name: "Public Service",
    text: "Society, policy, law and community impact",
    careers: ["Lawyer", "Civil Servant", "Social Worker", "Teacher"],
    keywords: [
      "law",
      "llb",
      "ll.b",
      "public",
      "social work",
      "msw",
      "bsw",
      "political",
      "history",
      "sociology",
      "b.ed",
      "education",
      "b.a",
      "ba ",
      "psychology",
    ],
    streams: ["Arts / Humanities", "Commerce", "Science (PCM)", "Science (PCB)"],
  },
  {
    name: "Pure Sciences & Research",
    text: "Physics, chemistry, maths and discovering how things work",
    careers: ["Scientist", "Researcher", "Statistician", "Lecturer"],
    keywords: [
      "b.sc",
      "bsc",
      "m.sc",
      "msc",
      "physics",
      "chemistry",
      "mathematics",
      "maths",
      "statistics",
      "research",
      "ph.d",
      "phd",
    ],
    streams: ["Science (PCM)", "Science (PCB)"],
  },
] as const;
export type AreaName = (typeof AREAS)[number]["name"];
export const BACKGROUNDS = [
  "Class 10",
  "Science (PCM)",
  "Science (PCB)",
  "Commerce",
  "Arts / Humanities",
  "Graduate",
] as const;

export type Plan = {
  interests: AreaName[];
  background: string;
  level: string; // UG, PG, Diploma…
  states: string[];
  budget: number | null; // max annual fee
  exams: string[];
};

export type Match = {
  course: CollegeCourse;
  college: College;
  score: number;
  reasons: string[];
  cautions: string[];
};

const norm = (s: string | null | undefined) => ` ${(s || "").toLowerCase()} `;
const lakh = (n: number) => `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} L`;

/**
 * Scores every published course against the plan. Each point is tied to a
 * reason shown to the student, so the ranking is explainable, not a black box.
 */
export function matchCourses(plan: Plan, colleges: College[], courses: CollegeCourse[]): Match[] {
  const byId = new Map(colleges.map((c) => [c.id, c]));
  const areas = AREAS.filter((a) => plan.interests.includes(a.name));
  const exams = plan.exams.map((e) => e.trim().toLowerCase()).filter(Boolean);
  const out: Match[] = [];
  for (const course of courses) {
    const college = byId.get(course.college_id);
    if (!college) continue;
    const text = norm(`${course.course_name} ${course.stream}`);
    const area = areas.find((a) => a.keywords.some((k) => text.includes(k)));
    if (areas.length && !area) continue;
    const reasons: string[] = [];
    const cautions: string[] = [];
    let score = 0;
    if (area) {
      score += 40;
      reasons.push(`Fits your interest in ${area.name}`);
      if (
        plan.background &&
        !(area.streams as readonly string[]).includes(plan.background) &&
        plan.background !== "Graduate" &&
        plan.background !== "Class 10"
      )
        cautions.push(`Usually suits ${area.streams[0]} students; check eligibility`);
    }
    if (plan.level) {
      if (course.level === plan.level) {
        score += 15;
        reasons.push(`${plan.level} programme`);
      } else if (course.level) continue;
    }
    if (plan.states.length) {
      if (college.state && plan.states.includes(college.state)) {
        score += 20;
        reasons.push(`In ${college.state}`);
      } else score -= 10;
    }
    if (plan.budget != null) {
      if (course.tuition_fee == null) cautions.push("Fee not published yet");
      else if (course.tuition_fee <= plan.budget) {
        score += 20;
        reasons.push(`${lakh(course.tuition_fee)}/yr is within your budget`);
      } else {
        score -= 25;
        cautions.push(`${lakh(course.tuition_fee)}/yr is above your ${lakh(plan.budget)} budget`);
      }
    }
    const accepted = splitExams(course.entrance_exams).map((e) => e.trim().toLowerCase());
    const shared = accepted.filter((e) => exams.includes(e));
    if (shared.length) {
      score += 15;
      reasons.push(`Accepts ${shared.map((e) => e.toUpperCase()).join(", ")}, which you're taking`);
    } else if (accepted.length && exams.length) cautions.push(`Needs ${course.entrance_exams}`);
    out.push({ course, college, score, reasons, cautions });
  }
  return out.sort(
    (a, b) =>
      b.score - a.score ||
      (a.course.tuition_fee ?? Infinity) - (b.course.tuition_fee ?? Infinity) ||
      a.college.name.localeCompare(b.college.name),
  );
}

/** Next actions for the student's checklist, derived from their top matches. */
export function suggestSteps(plan: Plan, top: Match[]) {
  const steps = new Set<string>();
  const exams = new Set(
    top.flatMap((m) => splitExams(m.course.entrance_exams).map((e) => e.trim())),
  );
  for (const e of [...exams].filter(Boolean).slice(0, 3)) steps.add(`Register for ${e}`);
  for (const m of top.slice(0, 3))
    steps.add(`Check ${m.college.name} admission dates for ${m.course.course_name}`);
  steps.add("Keep Class 10 and 12 marksheets, ID and photos ready");
  if (plan.budget != null) steps.add("Look up scholarships you are eligible for");
  return [...steps];
}
