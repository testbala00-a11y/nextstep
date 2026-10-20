CREATE TYPE public.app_role AS ENUM ('student', 'admin');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'unpublished');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  school_class text,
  stream text,
  interests text[] NOT NULL DEFAULT '{}',
  district text,
  fee_budget numeric(12,2),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_fee_budget_nonnegative CHECK (fee_budget IS NULL OR fee_budget >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  required_interests text[] NOT NULL DEFAULT '{}',
  pathways text[] NOT NULL DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.careers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careers TO authenticated;
GRANT ALL ON public.careers TO service_role;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration text,
  credential text,
  entry_requirements text NOT NULL DEFAULT '',
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text NOT NULL DEFAULT '',
  college_type text NOT NULL DEFAULT '',
  address text,
  description text NOT NULL DEFAULT '',
  annual_fee numeric(12,2),
  fee_verified boolean NOT NULL DEFAULT false,
  fee_source_url text,
  fee_last_verified_at timestamptz,
  source_url text,
  last_verified_at timestamptz,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT colleges_annual_fee_nonnegative CHECK (annual_fee IS NULL OR annual_fee >= 0),
  CONSTRAINT colleges_verified_fee_has_evidence CHECK (NOT fee_verified OR (annual_fee IS NOT NULL AND fee_source_url IS NOT NULL AND fee_last_verified_at IS NOT NULL))
);
GRANT SELECT ON public.colleges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colleges TO authenticated;
GRANT ALL ON public.colleges TO service_role;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.college_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT college_courses_unique UNIQUE (college_id, course_id)
);
GRANT SELECT ON public.college_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.college_courses TO authenticated;
GRANT ALL ON public.college_courses TO service_role;
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.career_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT career_courses_unique UNIQUE (career_id, course_id)
);
GRANT SELECT ON public.career_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_courses TO authenticated;
GRANT ALL ON public.career_courses TO service_role;
ALTER TABLE public.career_courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position smallint NOT NULL UNIQUE,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assessment_questions_position_range CHECK (position BETWEEN 1 AND 10),
  CONSTRAINT assessment_questions_options_array CHECK (jsonb_typeof(options) = 'array')
);
GRANT SELECT ON public.assessment_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_questions TO authenticated;
GRANT ALL ON public.assessment_questions TO service_role;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attempt_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assessment_responses_attempt_question_unique UNIQUE (attempt_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_responses TO authenticated;
GRANT ALL ON public.assessment_responses TO service_role;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.saved_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_colleges_user_college_unique UNIQUE (user_id, college_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_colleges TO authenticated;
GRANT ALL ON public.saved_colleges TO service_role;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.saved_careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_careers_user_career_unique UNIQUE (user_id, career_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_careers TO authenticated;
GRANT ALL ON public.saved_careers TO service_role;
ALTER TABLE public.saved_careers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admission_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  deadline_at timestamptz,
  source_url text,
  last_verified_at timestamptz,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admission_notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_notices TO authenticated;
GRANT ALL ON public.admission_notices TO service_role;
ALTER TABLE public.admission_notices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.application_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  details text NOT NULL DEFAULT '',
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_checklists TO authenticated;
GRANT ALL ON public.application_checklists TO service_role;
ALTER TABLE public.application_checklists ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX careers_status_idx ON public.careers(status);
CREATE INDEX courses_status_idx ON public.courses(status);
CREATE INDEX colleges_status_district_type_idx ON public.colleges(status, district, college_type);
CREATE INDEX college_courses_course_id_idx ON public.college_courses(course_id);
CREATE INDEX college_courses_college_id_idx ON public.college_courses(college_id);
CREATE INDEX career_courses_course_id_idx ON public.career_courses(course_id);
CREATE INDEX career_courses_career_id_idx ON public.career_courses(career_id);
CREATE INDEX assessment_questions_status_position_idx ON public.assessment_questions(status, position);
CREATE INDEX assessment_responses_user_attempt_idx ON public.assessment_responses(user_id, attempt_id);
CREATE INDEX assessment_responses_question_id_idx ON public.assessment_responses(question_id);
CREATE INDEX saved_colleges_user_id_idx ON public.saved_colleges(user_id);
CREATE INDEX saved_colleges_college_id_idx ON public.saved_colleges(college_id);
CREATE INDEX saved_careers_user_id_idx ON public.saved_careers(user_id);
CREATE INDEX saved_careers_career_id_idx ON public.saved_careers(career_id);
CREATE INDEX admission_notices_status_deadline_idx ON public.admission_notices(status, deadline_at);
CREATE INDEX admission_notices_college_id_idx ON public.admission_notices(college_id);
CREATE INDEX admission_notices_course_id_idx ON public.admission_notices(course_id);
CREATE INDEX application_checklists_user_due_idx ON public.application_checklists(user_id, due_date);
CREATE INDEX application_checklists_college_id_idx ON public.application_checklists(college_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_profile_and_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT (user_id, role) DO NOTHING;
  IF lower(COALESCE(NEW.email, '')) = 'testbala00@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auth_user_profile_and_role_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_user_profile_and_role();

CREATE OR REPLACE FUNCTION public.require_verified_college_before_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'published' AND (NULLIF(btrim(NEW.source_url), '') IS NULL OR NEW.last_verified_at IS NULL) THEN
    RAISE EXCEPTION 'Published college records require a source URL and verification date.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER colleges_publish_requires_source
BEFORE INSERT OR UPDATE ON public.colleges
FOR EACH ROW EXECUTE FUNCTION public.require_verified_college_before_publish();

CREATE OR REPLACE FUNCTION public.require_verified_notice_before_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'published' AND (NULLIF(btrim(NEW.source_url), '') IS NULL OR NEW.last_verified_at IS NULL) THEN
    RAISE EXCEPTION 'Published admission notices require a source URL and verification date.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notices_publish_requires_source
BEFORE INSERT OR UPDATE ON public.admission_notices
FOR EACH ROW EXECUTE FUNCTION public.require_verified_notice_before_publish();

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'user_roles', 'careers', 'courses', 'colleges', 'college_courses',
    'career_courses', 'assessment_questions', 'assessment_responses', 'saved_colleges',
    'saved_careers', 'admission_notices', 'application_checklists'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', table_name || '_set_updated_at', table_name);
  END LOOP;
END;
$$;

CREATE POLICY profiles_read_own_or_admin ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

CREATE POLICY careers_published_read ON public.careers FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY careers_admin_all ON public.careers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY courses_published_read ON public.courses FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY courses_admin_all ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY colleges_published_read ON public.colleges FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY colleges_admin_all ON public.colleges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY college_courses_published_read ON public.college_courses FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.colleges c WHERE c.id = college_id AND c.status = 'published')
  AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.status = 'published')
);
CREATE POLICY college_courses_admin_all ON public.college_courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY career_courses_published_read ON public.career_courses FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.careers c WHERE c.id = career_id AND c.status = 'published')
  AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.status = 'published')
);
CREATE POLICY career_courses_admin_all ON public.career_courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY assessment_questions_published_read ON public.assessment_questions FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY assessment_questions_admin_all ON public.assessment_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY assessment_responses_read_own ON public.assessment_responses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY assessment_responses_insert_own ON public.assessment_responses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY assessment_responses_update_own ON public.assessment_responses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY assessment_responses_delete_own ON public.assessment_responses FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY saved_colleges_read_own ON public.saved_colleges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY saved_colleges_insert_own ON public.saved_colleges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY saved_colleges_update_own ON public.saved_colleges FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY saved_colleges_delete_own ON public.saved_colleges FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY saved_careers_read_own ON public.saved_careers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY saved_careers_insert_own ON public.saved_careers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY saved_careers_update_own ON public.saved_careers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY saved_careers_delete_own ON public.saved_careers FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY admission_notices_published_read ON public.admission_notices FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY admission_notices_admin_all ON public.admission_notices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY application_checklists_read_own ON public.application_checklists FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY application_checklists_insert_own ON public.application_checklists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY application_checklists_update_own ON public.application_checklists FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY application_checklists_delete_own ON public.application_checklists FOR DELETE TO authenticated USING (user_id = auth.uid());