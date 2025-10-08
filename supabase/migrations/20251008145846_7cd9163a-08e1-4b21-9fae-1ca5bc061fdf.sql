-- Add columns to store CV and JD summaries in scheduled_interviews table
ALTER TABLE scheduled_interviews 
ADD COLUMN cv_summary text,
ADD COLUMN jd_summary text;