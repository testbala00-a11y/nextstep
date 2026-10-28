import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  getAdminState,
  getCachedAdminState,
  needsOnboarding,
  type AdminState,
} from "@/lib/admin-auth";
import { AdminShell } from "@/components/AdminShell";

const allowed = (s: AdminState | null, superOnly: boolean) =>
  !!s?.user && s.isAdmin && !needsOnboarding(s) && (!superOnly || s.accessLevel === "super_admin");

/** Access level of the signed-in admin; only valid inside <AdminGate>. */
export function useAdminAccess() {
  const s = getCachedAdminState();
  return { isSuperAdmin: s?.accessLevel === "super_admin", userId: s?.user?.id ?? null };
}

export function AdminGate({
  children,
  superAdminOnly = false,
}: {
  children: ReactNode;
  superAdminOnly?: boolean;
}) {
  const navigate = useNavigate();
  // Once verified in this session the cached state renders immediately.
  const [state, setState] = useState<AdminState | null>(() => getCachedAdminState());
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getAdminState()
      .then((s) => {
        if (!active) return;
        if (!s.user || !s.isAdmin) navigate({ to: "/admin/login" });
        else if (needsOnboarding(s)) navigate({ to: "/admin/onboarding" });
        else if (superAdminOnly && s.accessLevel !== "super_admin") navigate({ to: "/admin" });
        else setState(s);
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [navigate, superAdminOnly]);
  if (error)
    return (
      <div role="alert" className="p-10 text-red-700">
        Admin verification failed: {error}
      </div>
    );
  if (!allowed(state, superAdminOnly))
    return (
      <p role="status" className="p-10">
        Loading…
      </p>
    );
  return <AdminShell isSuperAdmin={state?.accessLevel === "super_admin"}>{children}</AdminShell>;
}
