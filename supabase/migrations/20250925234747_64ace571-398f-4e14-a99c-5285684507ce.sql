-- Check if the trigger exists and create it if missing
DO $$ 
BEGIN
  -- Drop the trigger if it exists to recreate it
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create the trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    
END $$;