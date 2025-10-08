-- Create storage buckets for CVs and JDs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('interview-cvs', 'interview-cvs', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('interview-jds', 'interview-jds', false);

-- Add CV and JD file path columns to scheduled_interviews table
ALTER TABLE public.scheduled_interviews 
ADD COLUMN cv_file_path TEXT,
ADD COLUMN jd_file_path TEXT;

-- Storage policies for CVs bucket
CREATE POLICY "Users can upload CVs for their interviews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'interview-cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own interview CVs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interview-cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own interview CVs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'interview-cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for JDs bucket
CREATE POLICY "Users can upload JDs for their interviews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'interview-jds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own interview JDs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interview-jds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own interview JDs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'interview-jds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);