import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getAdminState } from '@/lib/admin-auth';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin/staff')({ component: StaffAccess });

function StaffAccess() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getAdminState().then(state => {
      if (!active) return;
      if (!state.user || !state.isAdmin) navigate({to:'/admin/login'});
      else if (!state.profile?.onboarding_completed_at) navigate({to:'/admin/onboarding'});
      else if (state.accessLevel !== 'super_admin') navigate({to:'/admin'});
      else setAllowed(true);
    }).catch(err => { if(active) setError(err instanceof Error ? err.message : 'Unable to verify privileges.'); })
      .finally(() => { if(active) setChecking(false); });
    return () => {active = false;};
  }, [navigate]);

  async function changeAccess(event: FormEvent<HTMLFormElement>, grant: boolean) {
    event.preventDefault(); setMessage(''); setError('');
    if (!grant && !window.confirm(`Revoke admin privileges for ${email.trim()}?`)) return;
    setBusy(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('manage_nextstep_staff', {
        _email: email.trim().toLowerCase(), _grant_access: grant,
      });
      if (rpcError) throw rpcError;
      setMessage(String(data || 'Access updated.')); setEmail('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Access change failed.'); }
    finally {setBusy(false);}
  }

  return <AdminShell isSuperAdmin={allowed}>
    <h1 className="font-heading text-3xl font-bold text-brand-navy">Staff administrators</h1>
    <p className="mt-2 text-slate-600">Only the super admin can grant or revoke staff access. Staff sign in using their own email and password.</p>
    {checking ? <p className="mt-6">Checking your permissions…</p> : allowed ?
      <form className="mt-7 max-w-xl rounded-2xl border bg-white p-6 shadow-sm" onSubmit={event => changeAccess(event, true)}>
        <label htmlFor="staff-email" className="block text-sm font-semibold">Verified staff account email</label>
        <input id="staff-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="staff@example.com" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3" />
        <p className="mt-2 text-sm text-slate-500">Staff must first create and verify a normal student account. This form grants administrator access to that account.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={busy} type="submit" className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">Grant staff access</button>
          <button disabled={busy} type="button" onClick={event => changeAccess(event as unknown as FormEvent<HTMLFormElement>, false)} className="rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-700 disabled:opacity-50">Revoke staff access</button>
        </div>
        {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </form> : error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
  </AdminShell>;
}
