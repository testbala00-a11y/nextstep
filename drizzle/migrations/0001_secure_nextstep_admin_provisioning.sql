CREATE OR REPLACE FUNCTION public.create_user_profile_and_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP POLICY profiles_read_own_or_admin ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY profiles_delete_own ON public.profiles;

DROP POLICY assessment_responses_insert_own ON public.assessment_responses;
CREATE POLICY assessment_responses_insert_own ON public.assessment_responses FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.assessment_questions q WHERE q.id = question_id AND q.status = 'published')
);
DROP POLICY assessment_responses_update_own ON public.assessment_responses;
CREATE POLICY assessment_responses_update_own ON public.assessment_responses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.assessment_questions q WHERE q.id = question_id AND q.status = 'published')
);
