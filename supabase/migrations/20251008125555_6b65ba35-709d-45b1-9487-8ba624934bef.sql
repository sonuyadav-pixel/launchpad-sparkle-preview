-- Add attempts tracking to scheduled interviews
ALTER TABLE public.scheduled_interviews
ADD COLUMN attempts_count integer NOT NULL DEFAULT 0,
ADD COLUMN max_attempts integer NOT NULL DEFAULT 100;