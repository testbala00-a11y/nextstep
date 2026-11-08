import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { seo, SITE_URL } from "@/lib/seo";

const PATH = "/guides/after-12th";
const TITLE = "What to Do After 12th? Complete Career Guide for Students (2026) | NextStep";
const DESC =
  "Confused after 12th? A free guide to careers, courses and entrance exams after 12th Science, Commerce and Arts in India, and how to choose the right college.";

const streams = [
  {
    name: "After 12th Science (PCM)",
    items: [
      ["B.E. / B.Tech", "4 years · Engineering in CSE, AI & Data Science, ECE, Mechanical, Civil and more. Exams: JEE Main, JEE Advanced, state CETs, TNEA counselling."],
      ["B.Sc", "3 years · Physics, Maths, Computer Science, Data Science, Statistics. Leads to M.Sc, research or tech jobs."],
      ["BCA", "3 years · Software development and IT, a cheaper route into tech jobs."],
      ["B.Arch", "5 years · Architecture. Exams: NATA, JEE Main Paper 2."],
      ["Defence (NDA)", "Join the Army, Navy or Air Force after 12th through the UPSC NDA exam."],
    ],
  },
  {
    name: "After 12th Science (PCB)",
    items: [
      ["MBBS / BDS / AYUSH", "5–5.5 years · Doctor, dentist, Ayurveda, Siddha, Homeopathy. Exam: NEET-UG."],
      ["B.Sc Nursing", "4 years · Strong job demand in India and abroad."],
      ["B.Pharm", "4 years · Pharmacy, drug manufacturing and healthcare industry."],
      ["Allied Health Sciences", "B.Sc in Physiotherapy, Radiology, Lab Technology, Optometry and more, without needing a top NEET rank."],
      ["B.Sc Agriculture / Biotech", "4 / 3 years · Agriculture, food technology, biotechnology and research."],
    ],
  },
  {
    name: "After 12th Commerce",
    items: [
      ["B.Com", "3 years · Accounting, finance and banking careers."],
      ["CA / CMA / CS", "Professional courses for chartered accountancy, cost accounting and company secretary."],
      ["BBA / BMS", "3 years · Business management. Leads to MBA."],
      ["Economics / Banking & Finance", "Careers in banking, insurance, investment and policy."],
    ],
  },
  {
    name: "After 12th Arts / Humanities",
    items: [
      ["BA (Psychology, English, Economics, History...)", "3 years · Teaching, civil services, media, research."],
      ["Law (BA LLB, 5 years)", "Exams: CLAT, AILET and state law entrance exams."],
      ["Journalism & Mass Communication", "Media, digital content, advertising and PR."],
      ["Design / Fine Arts", "Fashion, UI/UX, interior and communication design. Exams: NID DAT, NIFT, UCEED."],
      ["Hotel Management", "Hospitality and tourism. Exam: NCHM JEE."],
    ],
  },
];

const steps = [
  ["Know yourself", "List the subjects you enjoy and are good at. Interest matters more than what friends or relatives choose."],
  ["Explore careers, not just courses", "Look at what people in that career do every day, the salary range and job demand in 5 years."],
  ["Check entrance exams early", "Most good colleges admit through an exam (JEE, NEET, CUET, CLAT, state counselling). Note the application dates."],
  ["Shortlist colleges", "Compare fees, location, accreditation (NAAC/NBA), placements and courses offered."],
  ["Plan your budget", "Add tuition, hostel and other fees. Check scholarships and education loans."],
  ["Keep a backup plan", "Apply to at least one safe option in case your first choice does not work out."],
];

const faqs = [
  ["What is the best course after 12th?", "There is no single best course. The best course is the one that matches your interests, marks and budget. Science students often choose engineering, medicine or B.Sc; commerce students choose B.Com, CA or BBA; arts students choose BA, law, design or media. NextStep's free planner helps you find options that fit you."],
  ["Which is the best career guidance platform for students after 12th?", "NextStep (nextstepinfo.in) is a free career guidance platform for Indian students after 12th. It helps you explore careers and courses, search and compare colleges by fees and location, and build a personal next-step plan."],
  ["How do I choose the right college after 12th?", "Shortlist colleges that offer your course, then compare fees, location, accreditation, placements and admission process. On NextStep you can compare up to 3 colleges side by side."],
  ["What can I do after 12th if I don't get a good rank?", "You still have many options: state-level counselling, private universities, B.Sc, BCA, B.Com, BBA, diploma and allied health courses, or taking a drop year to prepare again."],
  ["Which courses after 12th have high salary?", "Engineering (especially Computer Science and AI), medicine, CA, law, data science and management (after an MBA) usually have high earning potential, but skill and college matter a lot."],
  ["Is NextStep free to use?", "Yes. Exploring careers, courses and colleges and creating your plan on NextStep is free."],
];

export const Route = createFileRoute("/guides/after-12th")({
  head: () => ({
    ...seo(PATH, TITLE, DESC),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "What to Do After 12th? Complete Career Guide for Students",
              description: DESC,
              url: SITE_URL + PATH,
              publisher: { "@type": "Organization", name: "NextStep", url: SITE_URL },
              dateModified: "2026-11-09",
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map(([q, a]) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Guide,
});

function Guide() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12">
        <article className="space-y-10">
          <header>
            <p className="font-semibold text-emerald-700">Career guide</p>
            <h1 className="mt-2 text-4xl font-bold text-brand-navy">
              What to do after 12th? A complete guide for students
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Finishing 12th is one of the biggest decisions of your life. This guide covers the main
              courses, careers and entrance exams after 12th Science, Commerce and Arts in India, and a
              simple way to choose. When you are ready,{" "}
              <Link to="/student/assessment" className="font-semibold text-blue-700 underline">
                build your free next-step plan
              </Link>
              .
            </p>
          </header>

          {streams.map((s) => (
            <section key={s.name}>
              <h2 className="text-2xl font-bold text-brand-navy">{s.name}</h2>
              <ul className="mt-4 space-y-3">
                {s.items.map(([t, d]) => (
                  <li key={t} className="rounded-xl border bg-white p-4">
                    <h3 className="font-semibold text-slate-900">{t}</h3>
                    <p className="text-slate-700">{d}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-bold text-brand-navy">How to choose the right course and college</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6">
              {steps.map(([t, d]) => (
                <li key={t}>
                  <strong>{t}:</strong> {d}
                </li>
              ))}
            </ol>
            <p className="mt-4">
              Ready to shortlist?{" "}
              <Link to="/colleges" className="font-semibold text-blue-700 underline">Explore colleges</Link>,{" "}
              <Link to="/courses" className="font-semibold text-blue-700 underline">browse courses</Link> or{" "}
              <Link to="/colleges/compare" className="font-semibold text-blue-700 underline">compare colleges</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-navy">Frequently asked questions</h2>
            <div className="mt-4 space-y-4">
              {faqs.map(([q, a]) => (
                <div key={q}>
                  <h3 className="font-semibold text-slate-900">{q}</h3>
                  <p className="text-slate-700">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
