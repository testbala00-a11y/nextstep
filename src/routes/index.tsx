import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, GraduationCap, MapPin, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";

const pathways = [
  {
    icon: Compass,
    label: "Explore careers",
    description: "Discover possibilities that connect with what you enjoy and do well.",
    accent: "bg-secondary text-secondary-foreground",
  },
  {
    icon: GraduationCap,
    label: "Find courses",
    description: "Get to know the courses and study routes behind different careers.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    label: "Plan your next step",
    description: "Explore colleges and make a plan that feels right for you.",
    accent: "bg-brand-mint text-brand-navy",
  },
];

const steps = ["Discover", "Explore", "Compare", "Plan"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NextStep — Your Future Starts Here" },
      {
        name: "description",
        content:
          "Find career ideas, courses, and colleges for your next step after school with NextStep.",
      },
      { property: "og:title", content: "NextStep — Your Future Starts Here" },
      {
        property: "og:description",
        content:
          "Find career ideas, courses, and colleges for your next step after school with NextStep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main id="home" className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-6xl flex-wrap items-center justify-between gap-4 py-3 px-5 sm:px-8">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center justify-center gap-6 md:order-none md:w-auto"
          >
            <a
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href="/colleges"
            >
              Colleges
            </a>
            <a
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href="/courses"
            >
              Courses
            </a>
            <a
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href="/student/assessment"
            >
              Plan my next step
            </a>
          </nav>
          <Button asChild size="sm" className="h-10 gap-2 px-4">
            <a href="/student/login">
              Login <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20"
        aria-labelledby="hero-title"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-brand-navy shadow-sm">
            <span className="size-2 rounded-full bg-brand-green" />
            FOR STUDENTS IN CLASSES 11 &amp; 12
          </div>
          <h1
            id="hero-title"
            className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.13] text-brand-navy sm:text-5xl sm:leading-[1.13] md:text-6xl"
          >
            Your future starts with <span className="text-primary">a next step.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Find career ideas, explore courses, and plan what comes after school—with a little more
            clarity at every step.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full gap-2 px-6 sm:w-auto">
              <a href="/colleges">
                Explore colleges <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <a
              className="inline-flex h-11 items-center gap-1 px-3 text-sm font-semibold text-brand-navy transition-colors hover:text-primary"
              href="#how-it-works"
            >
              See how it works <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>

          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border/80 pt-6 text-xs font-medium text-muted-foreground sm:mt-14">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-green" /> Career discovery
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" /> Course exploration
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-navy" /> College planning
            </span>
          </div>
        </div>
      </section>

      <section
        id="pathways"
        className="scroll-mt-24 border-y border-border bg-card px-5 py-14 sm:px-8 sm:py-16"
        aria-labelledby="pathways-title"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-green">
                A good place to begin
              </p>
              <h2
                id="pathways-title"
                className="mt-2 text-2xl font-semibold text-brand-navy sm:text-3xl"
              >
                A path that feels like yours
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Big decisions get easier when you take them one clear step at a time.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pathways.map(({ icon: Icon, label, description, accent }, index) => (
              <a
                key={label}
                href={index === 0 ? "/student/assessment" : index === 1 ? "/courses" : "/colleges"}
                className="group flex min-h-48 flex-col border-t-2 border-border px-1 pt-5 transition-colors hover:border-brand-green"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex size-11 items-center justify-center rounded-xl ${accent}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
                  {label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 px-5 py-14 sm:px-8 sm:py-16"
        aria-labelledby="steps-title"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-green">
              A little clarity goes a long way
            </p>
            <h2
              id="steps-title"
              className="mt-2 text-2xl font-semibold text-brand-navy sm:text-3xl"
            >
              Four steps. Your own pace.
            </h2>
          </div>
          <ol className="mt-9 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-4 sm:gap-4">
            {steps.map((step, index) => (
              <li
                key={step}
                className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-4"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  0{index + 1}
                </span>
                <span className="font-heading text-base font-semibold text-brand-navy">{step}</span>
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-10 top-5 hidden h-px w-[calc(100%-2rem)] bg-border sm:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="career-buddy"
        className="scroll-mt-24 bg-brand-navy px-5 py-12 text-primary-foreground sm:px-8 sm:py-14"
        aria-labelledby="buddy-title"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10 p-2.5">
              <img
                src="/favicon.png"
                alt="NextStep Growth Mark"
                width={40}
                height={40}
                className="size-full object-contain"
              />
            </span>
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-brand-mint">
                <Sparkles aria-hidden="true" className="size-3.5" /> A NextStep companion
              </p>
              <h2 id="buddy-title" className="mt-1 font-heading text-2xl font-semibold">
                Nex Career Buddy
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/75">
                A friendly starting point to reflect on your interests and think through what you
                might explore next.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="h-11 shrink-0 gap-2">
            <a href="/student/assessment">
              Start exploring <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Brand compact />
          <p className="text-xs text-muted-foreground">Your Future Starts Here.</p>
          <a
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            href="#home"
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
