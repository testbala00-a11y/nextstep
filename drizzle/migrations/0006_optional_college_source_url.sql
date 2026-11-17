CREATE OR REPLACE FUNCTION public.require_verified_college_before_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.last_verified_at IS NULL THEN
    RAISE EXCEPTION 'Published college records require a verification date.';
  END IF;
  RETURN NEW;
END;
$$;
