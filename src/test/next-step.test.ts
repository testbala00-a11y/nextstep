import { describe, expect, it } from "vitest";
import { matchCourses } from "@/lib/next-step";
import type { College, CollegeCourse } from "@/lib/college-data";

const college = (id: string, state: string) =>
  ({ id, name: id, state, district: "", college_type: "", status: "published" }) as College;
const course = (id: string, college_id: string, course_name: string, fee: number, exams = "") =>
  ({
    id,
    college_id,
    course_name,
    level: "UG",
    tuition_fee: fee,
    entrance_exams: exams,
  }) as CollegeCourse;

describe("matchCourses", () => {
  const colleges = [college("A", "Tamil Nadu"), college("B", "Kerala")];
  const courses = [
    course("1", "A", "B.Tech Computer Science", 150000, "JEE Main, TNEA"),
    course("2", "B", "B.Tech Computer Science", 400000, "KEAM"),
    course("3", "A", "MBBS", 100000, "NEET"),
  ];
  const plan = {
    interests: ["Technology" as const],
    background: "Science (PCM)",
    level: "UG",
    states: ["Tamil Nadu"],
    budget: 200000,
    exams: ["JEE Main"],
  };

  it("keeps only courses matching the chosen interests", () => {
    expect(matchCourses(plan, colleges, courses).map((m) => m.course.id)).toEqual(["1", "2"]);
  });

  it("ranks in-state, in-budget, exam-matching courses first with reasons", () => {
    const [best, other] = matchCourses(plan, colleges, courses);
    expect(best!.course.id).toBe("1");
    expect(best!.reasons.join(" ")).toMatch(/Tamil Nadu.*budget.*JEE MAIN/s);
    expect(other!.cautions.some((c) => c.includes("above your"))).toBe(true);
  });
});
