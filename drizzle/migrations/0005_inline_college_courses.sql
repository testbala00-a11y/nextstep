-- NextStep v5: courses live inside each college. Run after 0000 through 0004.
-- college_courses rows now carry their own course details, so admins add courses
-- while editing a college instead of linking to a separate global course list.
ALTER TABLE public.college_courses ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS course_name text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS stream text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS seats integer;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS eligibility text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS entrance_exams text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Copy details from previously linked global courses.
UPDATE public.college_courses cc
SET course_name = COALESCE(cc.course_name, c.name),
    duration = COALESCE(cc.duration, c.duration),
    level = COALESCE(cc.level, c.credential),
    eligibility = COALESCE(cc.eligibility, NULLIF(c.entry_requirements, ''))
FROM public.courses c
WHERE c.id = cc.course_id;
UPDATE public.college_courses SET course_name = 'Untitled course' WHERE course_name IS NULL;
ALTER TABLE public.college_courses ALTER COLUMN course_name SET NOT NULL;

ALTER TABLE public.college_courses DROP CONSTRAINT IF EXISTS college_courses_seats_nonnegative;
ALTER TABLE public.college_courses ADD CONSTRAINT college_courses_seats_nonnegative CHECK (seats IS NULL OR seats >= 0);
CREATE UNIQUE INDEX IF NOT EXISTS college_courses_college_name_unique
  ON public.college_courses (college_id, lower(course_name));

-- Course rows are visible whenever their college is published.
DROP POLICY IF EXISTS college_courses_published_read ON public.college_courses;
CREATE POLICY college_courses_published_read ON public.college_courses FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.colleges c WHERE c.id = college_id AND c.status = 'published')
);

-- Track who last edited a college.
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Staff may add and edit colleges; only the super admin may delete them.
CREATE OR REPLACE FUNCTION public.is_nextstep_super_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_members WHERE user_id = _user AND access_level = 'super_admin');
$$;
REVOKE ALL ON FUNCTION public.is_nextstep_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_nextstep_super_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS colleges_admin_all ON public.colleges;
DROP POLICY IF EXISTS colleges_admin_read ON public.colleges;
DROP POLICY IF EXISTS colleges_admin_insert ON public.colleges;
DROP POLICY IF EXISTS colleges_admin_update ON public.colleges;
DROP POLICY IF EXISTS colleges_super_admin_delete ON public.colleges;
CREATE POLICY colleges_admin_read ON public.colleges FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY colleges_admin_insert ON public.colleges FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY colleges_admin_update ON public.colleges FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY colleges_super_admin_delete ON public.colleges FOR DELETE TO authenticated USING (public.is_nextstep_super_admin(auth.uid()));

-- Staff list for the super admin's Staff page.
CREATE OR REPLACE FUNCTION public.list_nextstep_staff()
RETURNS TABLE (user_id uuid, email text, full_name text, access_level text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_nextstep_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only the NextStep super admin may list staff.';
  END IF;
  RETURN QUERY
    SELECT m.user_id, u.email::text, p.full_name, m.access_level, m.created_at
    FROM public.admin_members m
    JOIN auth.users u ON u.id = m.user_id
    LEFT JOIN public.profiles p ON p.id = m.user_id
    ORDER BY m.access_level DESC, m.created_at;
END;
$$;
REVOKE ALL ON FUNCTION public.list_nextstep_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_nextstep_staff() TO authenticated;
