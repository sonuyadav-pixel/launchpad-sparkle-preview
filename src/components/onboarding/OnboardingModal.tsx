import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react';

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
  { id: 'welcome', title: 'Welcome', component: WelcomeStep, skippable: false },
  { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep, skippable: true },
  { id: 'professional-summary', title: 'Professional Summary', component: ProfessionalSummaryStep, skippable: true },
  { id: 'current-role', title: 'Current Role', component: CurrentRoleStep, skippable: true },
  { id: 'work-experience', title: 'Experience', component: WorkExperienceStep, skippable: true },
  { id: 'education', title: 'Education', component: EducationStep, skippable: true },
  { id: 'skills', title: 'Skills', component: SkillsStep, skippable: true },
  { id: 'certifications', title: 'Certifications', component: CertificationsStep, skippable: true },
  { id: 'career-preferences', title: 'Preferences', component: CareerPreferencesStep, skippable: true },
  { id: 'resume-upload', title: 'Resume', component: ResumeUploadStep, skippable: true },
  { id: 'profile-photo', title: 'Photo', component: ProfilePhotoStep, skippable: true },
  { id: 'review', title: 'Review', component: ReviewStep, skippable: false },
];

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
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
  const canSkipCurrentStep = currentStepData.skippable && !skippedSteps.has(currentStep);

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

  const handleSkipStep = () => {
    if (canSkipCurrentStep) {
      setSkippedSteps(prev => new Set([...prev, currentStep]));
      handleNext();
      
      toast({
        title: "Step skipped",
        description: "You can complete this step later in your profile settings.",
      });
    }
  };

  const handleCloseOnboarding = async () => {
    try {
      // Mark onboarding as completed
      const profileUpdates = {
        onboarding_completed: true,
      };
      
      await updateProfile(profileUpdates);
      onClose();
    } catch (error) {
      console.error('Error closing onboarding:', error);
      onClose(); // Still close even if update fails
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // Save onboarding data to profile
      const profileUpdates = {
        first_name: onboardingData.fullName.split(' ')[0] || '',
        last_name: onboardingData.fullName.split(' ').slice(1).join(' ') || '',
        onboarding_completed: true,
      };
      
      await updateProfile(profileUpdates);
      
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile has been created successfully.",
      });
      
      onClose();
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

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return skippedSteps.has(stepIndex) ? 'skipped' : 'completed';
    return 'pending';
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 overflow-hidden">
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Complete Your Profile</h1>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleCloseOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Close for now
            </Button>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="p-6 pb-0">
            <Progress value={progress} className="h-3 mb-4" />
            <div className="flex justify-between items-center mb-2">
              {ONBOARDING_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-1">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        status === 'current' 
                          ? 'bg-primary border-primary scale-125' 
                          : status === 'completed'
                          ? 'bg-primary border-primary'
                          : status === 'skipped'
                          ? 'bg-muted border-muted-foreground border-dashed'
                          : 'bg-background border-muted-foreground'
                      }`}
                    />
                    <span className={`text-xs text-center ${
                      status === 'current' ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
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
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-background/95 backdrop-blur-sm">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              {canSkipCurrentStep && (
                <Button
                  variant="ghost"
                  onClick={handleSkipStep}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <SkipForward className="h-4 w-4" />
                  <span>Skip Step</span>
                </Button>
              )}

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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};