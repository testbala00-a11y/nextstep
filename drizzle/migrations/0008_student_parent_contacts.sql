-- NextStep v8: student/parent contact details, visible to the super admin only. Run after 0007.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_valid;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_valid CHECK (user_type IS NULL OR user_type IN ('student','parent'));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$');

-- Profiles stay readable only by their owner (policy profiles_read_own from 0001), so
-- staff cannot see contacts. The super admin reads them through this function.
CREATE OR REPLACE FUNCTION public.list_nextstep_users()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  phone text,
  user_type text,
  sign_in_method text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_nextstep_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only the NextStep super admin may view user details.';
  END IF;
  RETURN QUERY
    SELECT u.id, p.full_name, u.email::text, p.phone, p.user_type,
           COALESCE(u.raw_app_meta_data->>'provider', 'email'),
           u.created_at, u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE NOT EXISTS (SELECT 1 FROM public.admin_members m WHERE m.user_id = u.id)
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.list_nextstep_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_nextstep_users() TO authenticated;
