-- Fix corrupted interview session durations
-- Identify sessions with unrealistic durations (> 4 hours = 14400 seconds)
-- and reasonable maximum duration (< 8 hours = 28800 seconds)

-- First, update sessions with obviously corrupted durations
UPDATE interview_sessions 
SET 
  duration_seconds = LEAST(7200, GREATEST(300, duration_seconds)),  -- Cap between 5 minutes and 2 hours
  ended_at = started_at + INTERVAL '2 hours'  -- Set reasonable end time
WHERE 
  duration_seconds > 14400  -- More than 4 hours
  AND started_at IS NOT NULL
  AND status IN ('completed', 'cancelled');

-- For sessions without proper start/end times but marked as completed
UPDATE interview_sessions 
SET 
  duration_seconds = 1800,  -- Default to 30 minutes
  started_at = created_at,
  ended_at = created_at + INTERVAL '30 minutes'
WHERE 
  (started_at IS NULL OR ended_at IS NULL)
  AND status IN ('completed', 'cancelled')
  AND duration_seconds > 3600;  -- More than 1 hour

-- Update sessions that are still 'active' for more than 1 hour to 'abandoned'
UPDATE interview_sessions 
SET 
  status = 'abandoned',
  ended_at = COALESCE(started_at, created_at) + INTERVAL '1 hour',
  duration_seconds = 3600
WHERE 
  status = 'active'
  AND (
    (started_at IS NOT NULL AND started_at < NOW() - INTERVAL '1 hour')
    OR 
    (started_at IS NULL AND created_at < NOW() - INTERVAL '1 hour')
  );

-- Create function to prevent sessions from running too long
CREATE OR REPLACE FUNCTION public.check_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent sessions from having unrealistic durations
  IF NEW.duration_seconds > 28800 THEN  -- 8 hours max
    NEW.duration_seconds = 7200;  -- Cap at 2 hours
    NEW.ended_at = NEW.started_at + INTERVAL '2 hours';
  END IF;
  
  -- Ensure minimum duration
  IF NEW.duration_seconds < 0 THEN
    NEW.duration_seconds = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate session durations
DROP TRIGGER IF EXISTS validate_session_duration ON interview_sessions;
CREATE TRIGGER validate_session_duration
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_session_duration();