-- Run in the SQL Editor of the Supabase project used by the Vercel deployment.
-- Requires setup migrations 0000 through 0003. Safe to rerun.
BEGIN;
DO $$
DECLARE
  owner_id uuid;
  confirmed_at timestamptz;
BEGIN
  SELECT id, email_confirmed_at INTO owner_id, confirmed_at
  FROM auth.users WHERE lower(email) = 'testbala00@gmail.com';
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Owner account not found. Check that this is the Supabase project used by Vercel.';
  END IF;
  IF confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Confirm the owner account email in Authentication before provisioning.';
  END IF;
  IF to_regclass('public.admin_members') IS NULL THEN
    RAISE EXCEPTION 'Apply migration 0003_admin_staff_roles.sql first.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = owner_id AND role = 'admin'
  ) THEN
    PERFORM private.provision_nextstep_first_admin('testbala00@gmail.com');
  END IF;
  INSERT INTO public.profiles (id) VALUES (owner_id) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.admin_members (user_id, access_level)
  VALUES (owner_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET access_level = 'super_admin';
END;
$$;
COMMIT;

-- Expected: one row with role = admin and access_level = super_admin.
SELECT u.email, r.role, m.access_level
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
JOIN public.admin_members m ON m.user_id = u.id
WHERE lower(u.email) = 'testbala00@gmail.com';
