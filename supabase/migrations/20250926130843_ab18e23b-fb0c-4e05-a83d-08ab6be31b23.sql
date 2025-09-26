-- Reset onboarding status for user who wants to redo onboarding
UPDATE profiles 
SET onboarding_completed = false 
WHERE email = 'sonuyadav.iit@gmail.com';