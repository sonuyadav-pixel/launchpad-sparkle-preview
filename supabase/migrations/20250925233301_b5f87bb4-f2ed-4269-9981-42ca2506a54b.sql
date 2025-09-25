-- Add invited_email column to scheduled_interviews table
ALTER TABLE public.scheduled_interviews 
ADD COLUMN invited_email TEXT;

-- Add index for better performance when querying by invited email
CREATE INDEX idx_scheduled_interviews_invited_email ON public.scheduled_interviews(invited_email);

-- Update RLS policies to allow users to view interviews they are invited to
CREATE POLICY "Users can view interviews they are invited to" 
ON public.scheduled_interviews 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (invited_email IS NOT NULL AND invited_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ))
);