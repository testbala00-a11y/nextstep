-- NextStep v7: store a student's Next Step plan preferences. Run after 0006.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_states text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exams_taken text[] NOT NULL DEFAULT '{}';
