import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
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
  { id: 'review', title: 'Review', component: ReviewStep },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : '',
    email: profile?.email || '',
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
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const StepComponent = currentStepData.component;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
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

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
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
            <div className="relative flex justify-between items-center mt-12 pt-8 pb-12 bg-gradient-to-r from-slate-50 to-gray-100 rounded-2xl shadow-inner">
              {/* 3D Background Track with depth effect */}
              <div 
                className="absolute top-1/2 h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 transform -translate-y-1/2 z-0 rounded-full shadow-inner"
                style={{ 
                  left: '1rem',
                  right: '1rem',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.8)'
                }}
              ></div>
              
              {/* 3D Progress Line with gradient and depth */}
              <div 
                className="absolute top-1/2 h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 transform -translate-y-1/2 z-10 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  left: '1rem',
                  width: currentStep > 0 ? `calc((100% - 2rem) * ${currentStep} / ${ONBOARDING_STEPS.length - 1})` : '0%',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(99, 102, 241, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                }}
              ></div>
              
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isUpcoming = index > currentStep;
                
                return (
                  <div 
                    key={step.id} 
                    className={`relative group cursor-pointer transition-all duration-300 flex flex-col items-center z-20 ${
                      isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
                    onClick={() => index < currentStep && setCurrentStep(index)}
                  >
                    {/* 3D Step Circle with enhanced depth */}
                    <div 
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                        isActive 
                          ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 border-purple-600 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border-orange-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border-gray-400 text-gray-600 shadow-md'
                      }`}
                      style={{
                        boxShadow: isActive 
                          ? '0 6px 20px rgba(139, 92, 246, 0.4), 0 3px 8px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)'
                          : isCompleted
                          ? '0 6px 20px rgba(251, 146, 60, 0.4), 0 3px 8px rgba(251, 146, 60, 0.3), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)'
                          : '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {/* 3D Inner highlight */}
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-t from-transparent to-white/20 pointer-events-none"></div>
                      
                      {isCompleted ? (
                        <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold relative z-10">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Label - Always show for completed, active, and nearby steps */}
                    {(isCompleted || isActive || Math.abs(index - currentStep) <= 1) && (
                      <div className={`${
                        index % 2 === 0 ? 'mt-3' : 'absolute -top-8 left-1/2 transform -translate-x-1/2'
                      } text-xs font-medium text-center whitespace-nowrap transition-opacity duration-300 ${
                        isActive ? 'text-primary opacity-100' : isCompleted ? 'text-green-600 opacity-90' : 'text-muted-foreground opacity-70'
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