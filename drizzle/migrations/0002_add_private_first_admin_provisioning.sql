CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.provision_nextstep_first_admin(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id uuid;
  confirmed_at timestamptz;
BEGIN
  IF lower(btrim(COALESCE(_email, ''))) <> 'testbala00@gmail.com' THEN
    RAISE EXCEPTION 'This email is not approved for first administrator provisioning.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('nextstep_first_admin_provisioning'));

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An administrator is already provisioned.';
  END IF;

  SELECT u.id, u.email_confirmed_at INTO target_user_id, confirmed_at
  FROM auth.users u
  WHERE lower(u.email) = lower(btrim(_email));

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'The approved account must sign up before it can be provisioned.';
  END IF;

  IF confirmed_at IS NULL THEN
    RAISE EXCEPTION 'The approved account email must be confirmed before provisioning.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN target_user_id;
END;
$$;
REVOKE ALL ON FUNCTION private.provision_nextstep_first_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.provision_nextstep_first_admin(text) TO service_role;