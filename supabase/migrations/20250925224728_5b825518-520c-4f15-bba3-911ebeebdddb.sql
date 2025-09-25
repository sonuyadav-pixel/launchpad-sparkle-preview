-- Update interview_sessions to support abandoned status
-- Since status is already a text column, we just need to ensure it accepts 'abandoned'
-- Add a check constraint to limit valid statuses
ALTER TABLE interview_sessions 
DROP CONSTRAINT IF EXISTS interview_sessions_status_check;

ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_status_check 
CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled', 'abandoned'));