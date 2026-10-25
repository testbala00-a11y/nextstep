import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/Brand";
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="flex w-full flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 sm:w-auto sm:justify-end"
        >
          <Link to="/colleges" className="hover:text-blue-700">
            Colleges
          </Link>
          <Link to="/courses" className="hover:text-blue-700">
            Courses
          </Link>
          <Link to="/student/assessment" className="hover:text-blue-700">
            Career Quiz
          </Link>
          <Link to="/student/login" className="hover:text-blue-700">
            Student login
          </Link>
          <Link
            to="/admin/login"
            className="rounded-lg bg-blue-700 px-3 py-2 text-white hover:bg-blue-800"
          >
            Admin <ArrowRight size={14} className="inline" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
      <div className="mb-4 flex justify-center">
        <Brand compact />
      </div>
      © {new Date().getFullYear()} NextStep · Your Future Starts Here · Information and fees should
      be independently verified.
    </footer>
  );
}
