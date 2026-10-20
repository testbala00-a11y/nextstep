-- Run after migrations 0000 through 0003 in Supabase SQL Editor.
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS tuition_fee numeric(12,2);
ALTER TABLE public.college_courses ADD COLUMN IF NOT EXISTS fee_notes text;
ALTER TABLE public.college_courses DROP CONSTRAINT IF EXISTS college_courses_tuition_fee_nonnegative;
ALTER TABLE public.college_courses ADD CONSTRAINT college_courses_tuition_fee_nonnegative CHECK(tuition_fee IS NULL OR tuition_fee >= 0);
-- Campus image uploads. Anyone can view published images; admin users alone can upload/delete.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('college-images','college-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;
CREATE POLICY "nextstep_public_college_images" ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id='college-images');
CREATE POLICY "nextstep_admin_upload_college_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='college-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "nextstep_admin_update_college_images" ON storage.objects FOR UPDATE TO authenticated USING(bucket_id='college-images' AND public.has_role(auth.uid(),'admin')) WITH CHECK(bucket_id='college-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "nextstep_admin_delete_college_images" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='college-images' AND public.has_role(auth.uid(),'admin'));
