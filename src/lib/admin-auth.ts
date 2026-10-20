import { supabase } from '@/integrations/supabase/client';

export async function getAdminState() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, isAdmin: false, profile: null, accessLevel: null };
  const { data: role, error: roleError } = await supabase.from('user_roles').select('id').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
  if (roleError) throw roleError;
  if (!role) return { user, isAdmin: false, profile: null, accessLevel: null };
  const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name,onboarding_completed_at').eq('id', user.id).maybeSingle();
  if (profileError) throw profileError;
  const { data: member, error: memberError } = await supabase.from('admin_members').select('access_level').eq('user_id', user.id).maybeSingle();
  if (memberError) throw memberError;
  return { user, isAdmin: true, profile, accessLevel: member?.access_level ?? null };
}
