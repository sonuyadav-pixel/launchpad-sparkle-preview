import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/pages/Onboarding';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingProgress {
  id?: string;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  onboardingData: OnboardingData;
  resumeData: any;
  loading: boolean;
  error: string | null;
}

export const useOnboardingProgress = () => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    onboardingData: {
      fullName: '',
      email: '',
      phoneNumber: '',
      location: '',
      headline: '',
      aboutMe: '',
      currentJobTitle: '',
      currentCompany: '',
      employmentType: 'Full-time',
      currentRoleStartDate: '',
      isCurrentRole: true,
      keyResponsibilities: [],
      totalYearsOfExperience: '',
      workExperience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        tools: [],
        frameworks: []
      },
      certifications: [],
      desiredRoles: [],
      preferredIndustries: [],
      preferredEmploymentType: ['Full-time'],
      preferredLocations: []
    },
    resumeData: null,
    loading: true,
    error: null
  });

  // Fetch resume data
  const fetchResumeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: resumeData, error } = await supabase
        .from('parsed_resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching resume data:', error);
        return;
      }

      if (resumeData) {
        setProgress(prev => ({
          ...prev,
          resumeData: resumeData.parsed_data
        }));
      }
    } catch (error) {
      console.error('Error in fetchResumeData:', error);
    }
  };

  // Load existing onboarding data on mount
  useEffect(() => {
    loadOnboardingProgress();
    fetchResumeData();
  }, []);

  const loadOnboardingProgress = async () => {
    try {
      setProgress(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Load existing progress with proper type conversions
        setProgress(prev => ({
          ...prev,
          id: data.id,
          currentStep: data.current_step,
          completedSteps: data.completed_steps || [],
          skippedSteps: data.skipped_steps || [],
          onboardingData: {
            fullName: data.full_name || '',
            email: data.email || '',
            phoneNumber: data.phone_number || '',
            location: data.location || '',
            linkedinUrl: data.linkedin_url,
            githubUrl: data.github_url,
            portfolioUrl: data.portfolio_url,
            headline: data.headline || '',
            aboutMe: data.about_me || '',
            currentJobTitle: data.current_job_title || '',
            currentCompany: data.current_company || '',
            employmentType: data.employment_type || 'Full-time',
            currentRoleStartDate: data.current_role_start_date || '',
            currentRoleEndDate: data.current_role_end_date,
            isCurrentRole: data.is_current_role ?? true,
            keyResponsibilities: data.key_responsibilities || [],
            totalYearsOfExperience: data.total_years_experience || '',
            workExperience: Array.isArray(data.work_experience) ? data.work_experience as any[] : [],
            education: Array.isArray(data.education) ? data.education as any[] : [],
            skills: (typeof data.skills === 'object' && data.skills !== null) ? data.skills as any : {
              technical: [],
              soft: [],
              tools: [],
              frameworks: []
            },
            certifications: Array.isArray(data.certifications) ? data.certifications as any[] : [],
            desiredRoles: data.desired_roles || [],
            preferredIndustries: data.preferred_industries || [],
            preferredEmploymentType: data.preferred_employment_type || ['Full-time'],
            salaryRange: (typeof data.salary_range === 'object' && data.salary_range !== null) ? data.salary_range as any : undefined,
            preferredLocations: data.preferred_locations || []
          },
          loading: false,
          error: null
        }));
      } else {
        // No existing data, start fresh
        setProgress(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      setProgress(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load progress'
      }));
    }
  };

  const saveProgress = async () => {
    try {
      console.log('🔄 Starting saveProgress...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      console.log('👤 User authenticated:', user.id);

      const saveData = {
        user_id: user.id,
        current_step: progress.currentStep,
        completed_steps: progress.completedSteps,
        skipped_steps: progress.skippedSteps,
        full_name: progress.onboardingData.fullName,
        email: progress.onboardingData.email,
        phone_number: progress.onboardingData.phoneNumber,
        location: progress.onboardingData.location,
        linkedin_url: progress.onboardingData.linkedinUrl,
        github_url: progress.onboardingData.githubUrl,
        portfolio_url: progress.onboardingData.portfolioUrl,
        headline: progress.onboardingData.headline,
        about_me: progress.onboardingData.aboutMe,
        current_job_title: progress.onboardingData.currentJobTitle,
        current_company: progress.onboardingData.currentCompany,
        employment_type: progress.onboardingData.employmentType,
        current_role_start_date: progress.onboardingData.currentRoleStartDate,
        current_role_end_date: progress.onboardingData.currentRoleEndDate,
        is_current_role: progress.onboardingData.isCurrentRole,
        key_responsibilities: progress.onboardingData.keyResponsibilities,
        total_years_experience: progress.onboardingData.totalYearsOfExperience,
        work_experience: progress.onboardingData.workExperience,
        education: progress.onboardingData.education,
        skills: progress.onboardingData.skills,
        certifications: progress.onboardingData.certifications,
        desired_roles: progress.onboardingData.desiredRoles,
        preferred_industries: progress.onboardingData.preferredIndustries,
        preferred_employment_type: progress.onboardingData.preferredEmploymentType,
        salary_range: progress.onboardingData.salaryRange,
        preferred_locations: progress.onboardingData.preferredLocations,
        resume_file_path: progress.onboardingData.resume_file_path,
        profile_photo_path: progress.onboardingData.profile_photo_path
      };

      console.log('💾 Saving data:', saveData);

      if (progress.id) {
        // Update existing record
        console.log('📝 Updating existing record with ID:', progress.id);
        const { error } = await supabase
          .from('user_onboarding')
          .update(saveData)
          .eq('id', progress.id);

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Record updated successfully');
      } else {
        // Create new record
        console.log('📝 Creating new record...');
        const { data, error } = await supabase
          .from('user_onboarding')
          .insert(saveData)
          .select()
          .single();

        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        
        console.log('✅ Record created successfully:', data);
        setProgress(prev => ({ ...prev, id: data.id }));
      }
    } catch (error) {
      console.error('❌ Error saving onboarding progress:', error);
      throw error; // Re-throw so the calling function can handle it
    }
  };

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setProgress(prev => ({
      ...prev,
      onboardingData: { ...prev.onboardingData, ...updates }
    }));
  };

  const setCurrentStep = (step: number) => {
    setProgress(prev => ({ ...prev, currentStep: step }));
  };

  const markStepCompleted = (step: number) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps.filter(s => s !== step), step]
    }));
  };

  const markStepSkipped = (step: number) => {
    setProgress(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps.filter(s => s !== step), step]
    }));
  };

  // Validation functions for mandatory steps
  const validateBasicInfo = () => {
    const { fullName, email, phoneNumber } = progress.onboardingData;
    return fullName.trim() && email.trim() && phoneNumber.trim();
  };

  const validateCurrentRole = () => {
    const { currentJobTitle, currentCompany } = progress.onboardingData;
    return currentJobTitle.trim() && currentCompany.trim();
  };

  const validateWorkExperience = () => {
    const { totalYearsOfExperience } = progress.onboardingData;
    return totalYearsOfExperience.trim();
  };

  const validateCareerPreferences = () => {
    const { desiredRoles } = progress.onboardingData;
    return desiredRoles.length > 0;
  };

  const validateResumeUpload = () => {
    return !!progress.onboardingData.resumeFile;
  };

  const validateProfilePhoto = () => {
    return !!progress.onboardingData.profilePhoto;
  };

  const canProceedFromStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 1: // Basic Info step
        return validateBasicInfo();
      case 2: // Current Role step
        return validateCurrentRole();
      case 3: // Work Experience step
        return validateWorkExperience();
      case 4: // Career Preferences step
        return validateCareerPreferences();
      case 5: // Resume Upload step
        return validateResumeUpload();
      case 6: // Profile Photo step
        return validateProfilePhoto();
      default:
        return true; // Other steps are optional or have their own validation
    }
  };

  return {
    ...progress,
    updateOnboardingData,
    setCurrentStep,
    markStepCompleted,
    markStepSkipped,
    saveProgress,
    loadOnboardingProgress,
    canProceedFromStep,
    validateBasicInfo,
    validateCurrentRole,
    validateWorkExperience,
    validateCareerPreferences,
    validateResumeUpload,
    validateProfilePhoto
  };
};