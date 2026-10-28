-- NextStep v6: all-India colleges, full course details, staff may delete. Run after 0005.
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS colleges_state_idx ON public.colleges (state);

ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS total_fee numeric(12,2);
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS cutoff text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS study_mode text;
ALTER TABLE public.college_courses DROP CONSTRAINT IF EXISTS college_courses_total_fee_nonnegative;
ALTER TABLE public.college_courses ADD CONSTRAINT college_courses_total_fee_nonnegative CHECK (total_fee IS NULL OR total_fee >= 0);

-- Staff and super admin can both delete colleges (courses are removed with them).
DROP POLICY IF EXISTS colleges_super_admin_delete ON public.colleges;
DROP POLICY IF EXISTS colleges_admin_delete ON public.colleges;
CREATE POLICY colleges_admin_delete ON public.colleges FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
