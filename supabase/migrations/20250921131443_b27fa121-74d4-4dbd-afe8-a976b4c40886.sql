-- Fix the security warning by setting search_path on the function
DROP FUNCTION IF EXISTS public.update_session_duration();

CREATE OR REPLACE FUNCTION public.update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' OR NEW.status = 'cancelled' THEN
    NEW.ended_at = now();
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
  ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.started_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;