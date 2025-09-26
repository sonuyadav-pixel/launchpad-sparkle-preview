import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Import all onboarding steps
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import ProfessionalSummaryStep from '@/components/onboarding/ProfessionalSummaryStep';
import CurrentRoleStep from '@/components/onboarding/CurrentRoleStep';
import WorkExperienceStep from '@/components/onboarding/WorkExperienceStep';
import EducationStep from '@/components/onboarding/EducationStep';
import SkillsStep from '@/components/onboarding/SkillsStep';
import CertificationsStep from '@/components/onboarding/CertificationsStep';
import CareerPreferencesStep from '@/components/onboarding/CareerPreferencesStep';
import ResumeUploadStep from '@/components/onboarding/ResumeUploadStep';
import ProfilePhotoStep from '@/components/onboarding/ProfilePhotoStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

export interface OnboardingData {
  // Basic Info
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  // Professional Summary
  headline: string;
  aboutMe: string;
  
  // Current Role
  currentJobTitle: string;
  currentCompany: string;
  employmentType: string;
  currentRoleStartDate: string;
  currentRoleEndDate?: string;
  isCurrentRole: boolean;
  keyResponsibilities: string[];
  
  // Work Experience
  totalYearsOfExperience: string;
  workExperience: Array<{
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    achievements: string[];
  }>;
  
  // Education
  education: Array<{
    id: string;
    degree: string;
    university: string;
    major: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  
  // Skills
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    frameworks: string[];
  };
  
  // Certifications
  certifications: Array<{
    id: string;
    name: string;
    organization: string;
    dateEarned: string;
    certificateUrl?: string;
  }>;
  
  // Career Preferences
  desiredRoles: string[];
  preferredIndustries: string[];
  preferredEmploymentType: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  preferredLocations: string[];
  
  // Resume & Photo
  resumeFile?: File;
  profilePhoto?: File;
}

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep },
  
  { id: 'current-role', title: 'Current Role', component: CurrentRoleStep },
  { id: 'work-experience', title: 'Experience', component: WorkExperienceStep },
  
  { id: 'career-preferences', title: 'Preferences', component: CareerPreferencesStep },
  { id: 'resume-upload', title: 'Resume', component: ResumeUploadStep },
  { id: 'profile-photo', title: 'Photo', component: ProfilePhotoStep },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  
  const {
    currentStep,
    onboardingData,
    loading,
    error,
    completedSteps,
    updateOnboardingData,
    setCurrentStep,
    markStepCompleted,
    saveProgress,
    canProceedFromStep,
    validateBasicInfo
  } = useOnboardingProgress();

  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Auto-save progress when data changes
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        saveProgress();
      }, 1000); // Debounce saves
      
      return () => clearTimeout(timeoutId);
    }
  }, [onboardingData, currentStep, loading, saveProgress]);

  useEffect(() => {
    // Autofill email from signed-in user
    if (profile?.email && !onboardingData.email) {
      updateOnboardingData({ email: profile.email });
    }
  }, [profile, onboardingData.email, updateOnboardingData]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const StepComponent = currentStepData.component;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    // Check if current step allows proceeding
    if (!canProceedFromStep(currentStep)) {
      setShowValidationErrors(true); // Trigger validation display
      return; // Validation errors will be shown inline
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
      setShowValidationErrors(false); // Reset validation for next step
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      // Mark onboarding as completed even when skipped
      const profileUpdates = {
        onboarding_completed: true,
      };
      
      await updateProfile(profileUpdates);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      navigate('/dashboard'); // Still redirect even if update fails
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // Save onboarding data to profile
      const profileUpdates = {
        first_name: onboardingData.fullName.split(' ')[0] || '',
        last_name: onboardingData.fullName.split(' ').slice(1).join(' ') || '',
        onboarding_completed: true,
        // Add other profile fields as needed
      };
      
      await updateProfile(profileUpdates);
      
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile has been created successfully.",
      });
      
      navigate('/dashboard/overview');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold">User Profile Setup</h1>
          </div>
          
        </div>

        {/* Interactive Step Display */}
        <div className="mb-8">
          
            
            {/* Interactive Step Dots */}
            <div className="relative flex justify-between items-center mt-12 pt-8 pb-12">
              {/* Progress Line - connecting completed circle centers progressively */}
              <div 
                className="absolute top-1/2 h-0.5 bg-primary transition-all duration-1000 ease-out transform -translate-y-1/2 z-0"
                style={{ 
                  left: '1rem',
                  width: currentStep > 0 ? `calc((100% - 2rem) * ${currentStep} / ${ONBOARDING_STEPS.length - 1})` : '0%'
                }}
              ></div>
              
              {/* Dotted Line for Uncompleted - connecting remaining circle centers */}
              <div 
                className="absolute top-1/2 h-0.5 border-t-2 border-dotted border-muted-foreground/30 transition-all duration-1000 ease-out transform -translate-y-1/2 z-0"
                style={{ 
                  left: currentStep > 0 ? `calc(1rem + (100% - 2rem) * ${currentStep} / ${ONBOARDING_STEPS.length - 1})` : '1rem',
                  right: '1rem'
                }}
              ></div>
              
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isUpcoming = index > currentStep;
                
                return (
                  <div 
                    key={step.id} 
                    className={`relative group cursor-pointer transition-all duration-300 flex flex-col items-center z-10 ${
                      isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
                    onClick={() => index < currentStep && setCurrentStep(index)}
                  >
                    {/* Step Circle */}
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary border-primary text-primary-foreground relative before:content-[""] before:absolute before:w-12 before:h-12 before:border-2 before:border-dashed before:border-blue-600 before:rounded-full before:-inset-2' 
                          : isCompleted
                          ? 'bg-blue-900 border-blue-900 text-white hover:bg-blue-800 hover:text-white'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Label - Always show for completed, active, and nearby steps */}
                    {(isCompleted || isActive || Math.abs(index - currentStep) <= 1) && (
                      <div className={`${
                        index % 2 === 0 ? 'mt-3' : 'absolute -top-8 left-1/2 transform -translate-x-1/2'
                      } text-xs font-medium text-center whitespace-nowrap transition-opacity duration-300 ${
                        isActive ? 'text-primary opacity-100' : isCompleted ? 'text-blue-900 opacity-90' : 'text-muted-foreground opacity-70'
                      }`}>
                        {step.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <StepComponent
                data={onboardingData}
                updateData={updateOnboardingData}
                onNext={handleNext}
                onComplete={handleCompleteOnboarding}
                showValidationErrors={showValidationErrors}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          {!isFirstStep && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              {!isLastStep && (
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {ONBOARDING_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-primary scale-125'
                  : index < currentStep
                  ? 'bg-primary/60'
                  : 'bg-muted'
              }`}
              title={step.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;