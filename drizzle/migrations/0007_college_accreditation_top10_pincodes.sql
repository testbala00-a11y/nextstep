ALTER TABLE public.colleges
  ADD COLUMN IF NOT EXISTS accreditation_details text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS is_top_10 boolean NOT NULL DEFAULT false;

UPDATE public.colleges
SET pincode = substring(district from '([0-9]{6})\s*$'),
    district = trim(regexp_replace(district, '[[:space:],(-]*[0-9]{6}[[:space:])]*$', '', 'g'))
WHERE district ~ '[0-9]{6}\s*$'
  AND pincode IS NULL;

ALTER TABLE public.colleges
  DROP CONSTRAINT IF EXISTS colleges_pincode_format,
  ADD CONSTRAINT colleges_pincode_format CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$');

CREATE INDEX IF NOT EXISTS colleges_pincode_idx ON public.colleges (pincode);

CREATE OR REPLACE FUNCTION public.enforce_college_top_10_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  selected_count integer;
BEGIN
  IF NEW.is_top_10 THEN
    IF TG_OP = 'UPDATE' AND OLD.is_top_10 THEN
      RETURN NEW;
    END IF;
    PERFORM pg_advisory_xact_lock(9281, 10010);
    SELECT count(*) INTO selected_count
    FROM public.colleges
    WHERE is_top_10 AND id <> NEW.id;
    IF selected_count >= 10 THEN
      RAISE EXCEPTION 'No more than 10 colleges can be marked Top 10.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS colleges_top_10_limit ON public.colleges;
CREATE TRIGGER colleges_top_10_limit
BEFORE INSERT OR UPDATE OF is_top_10 ON public.colleges
FOR EACH ROW EXECUTE FUNCTION public.enforce_college_top_10_limit();
