-- Create storage bucket for interview videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-videos',
  'interview-videos',
  false,
  524288000, -- 500MB limit
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
);

-- Create storage bucket for interview transcripts
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'interview-transcripts',
  'interview-transcripts',
  false
);

-- RLS policies for interview videos bucket
CREATE POLICY "Users can upload their own interview videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'interview-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own interview videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'interview-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own interview videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'interview-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for interview transcripts bucket
CREATE POLICY "Users can upload their own interview transcripts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'interview-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own interview transcripts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'interview-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own interview transcripts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'interview-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add columns to interview_sessions table for video and transcript URLs
ALTER TABLE interview_sessions
ADD COLUMN video_url text,
ADD COLUMN transcript_file_url text,
ADD COLUMN recording_duration_seconds integer;