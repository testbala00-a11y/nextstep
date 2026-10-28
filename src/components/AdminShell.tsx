import { Brand } from "@/components/Brand";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Users,
  Contact,
  Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
export function AdminShell({
  children,
  isSuperAdmin = false,
}: {
  children: ReactNode;
  isSuperAdmin?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Brand admin compact />
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[210px_1fr]">
        <aside className="space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 font-semibold text-blue-800"
          >
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link
            to="/admin/colleges"
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            <Building2 size={18} /> Colleges
          </Link>
          {isSuperAdmin && (
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              <Contact size={18} /> Students &amp; parents
            </Link>
          )}
          {isSuperAdmin && (
            <Link
              to="/admin/staff"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              <Users size={18} /> Staff logins
            </Link>
          )}
          <p className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
            <ShieldCheck size={18} /> Authorized admin
          </p>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
