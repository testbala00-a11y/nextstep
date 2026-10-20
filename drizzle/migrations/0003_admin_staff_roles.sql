-- NextStep v3: Super-admin/staff-admin access. Run after 0000, 0001 and 0002.
-- All sensitive changes are made by SECURITY DEFINER RPCs with an explicit
-- authenticated super-admin check; the browser cannot write roles directly.
CREATE TABLE IF NOT EXISTS public.admin_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL CHECK (access_level IN ('super_admin','staff_admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_members FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_members TO authenticated;
GRANT ALL ON public.admin_members TO service_role;
DROP POLICY IF EXISTS admin_members_read_self ON public.admin_members;
CREATE POLICY admin_members_read_self ON public.admin_members
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- Establish a first owner only when the approved, confirmed email has
-- already been explicitly provisioned as admin. Safe to rerun.
INSERT INTO public.admin_members (user_id, access_level)
SELECT u.id, 'super_admin'
FROM auth.users u JOIN public.user_roles r ON r.user_id=u.id AND r.role='admin'
WHERE lower(u.email)='testbala00@gmail.com' AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.manage_nextstep_staff(_email text, _grant_access boolean)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _actor uuid := auth.uid();
  _target uuid;
  _normalized text := lower(btrim(coalesce(_email, '')));
BEGIN
  IF _actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_members WHERE user_id = _actor AND access_level = 'super_admin'
  ) OR NOT public.has_role(_actor, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only the NextStep super admin may manage staff.';
  END IF;
  IF _normalized = '' THEN RAISE EXCEPTION 'Enter a staff account email.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('nextstep_manage_staff'));
  SELECT id INTO _target FROM auth.users WHERE lower(email)=_normalized AND email_confirmed_at IS NOT NULL;
  IF _target IS NULL THEN
    RAISE EXCEPTION 'No verified account found. Ask staff to create and verify their regular NextStep account first.';
  END IF;
  IF _target = _actor OR _normalized='testbala00@gmail.com' THEN
    RAISE EXCEPTION 'The super administrator account cannot be changed here.';
  END IF;
  IF _grant_access THEN
    INSERT INTO public.user_roles(user_id,role) VALUES(_target,'admin')
      ON CONFLICT (user_id,role) DO NOTHING;
    INSERT INTO public.admin_members(user_id,access_level) VALUES(_target,'staff_admin')
      ON CONFLICT(user_id) DO UPDATE SET access_level='staff_admin';
    RETURN 'Staff administrator access granted.';
  ELSE
    IF EXISTS (SELECT 1 FROM public.admin_members WHERE user_id=_target AND access_level='super_admin') THEN
      RAISE EXCEPTION 'Cannot revoke a super administrator.';
    END IF;
    DELETE FROM public.admin_members WHERE user_id=_target AND access_level='staff_admin';
    DELETE FROM public.user_roles WHERE user_id=_target AND role='admin';
    RETURN 'Staff administrator access revoked.';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.manage_nextstep_staff(text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manage_nextstep_staff(text,boolean) TO authenticated;

-- Legacy admin accounts receive no staff management privileges by default.
-- All admin page authorization continues to require the original admin role.
