import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import { useUserProfile } from '@/hooks/useUserProfile';

interface BasicInfoStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const { profile } = useUserProfile();
  
  React.useEffect(() => {
    // Autofill email from signed-in user
    if (profile?.email && !data.email) {
      updateData({ email: profile.email });
    }
  }, [profile, data.email, updateData]);

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value });
  };

  const isValid = data.fullName.trim() && data.email.trim() && data.location.trim();

  return (
    <div className="max-h-[60vh] space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-muted-foreground text-sm">
          Let&apos;s get to know you better
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Location *
            </Label>
            <Input
              id="location"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-10"
              disabled={!!profile?.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={data.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Professional Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Professional Links (Optional)
          </h3>
          
          <div className="space-y-3">
            <Input
              placeholder="LinkedIn profile URL"
              value={data.linkedinUrl || ''}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              className="h-9"
            />
            
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                placeholder="GitHub profile URL"
                value={data.githubUrl || ''}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                className="h-9"
              />
              
              <Input
                placeholder="Portfolio website URL"
                value={data.portfolioUrl || ''}
                onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          disabled={!isValid}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;