import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Sparkles, Target } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface ProfessionalSummaryStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const ProfessionalSummaryStep: React.FC<ProfessionalSummaryStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value });
  };

  const generateAISuggestion = () => {
    // Placeholder for AI suggestion functionality
    const suggestions = [
      "Senior Product Manager with 5+ years driving innovative solutions",
      "Full-stack Developer passionate about scalable web applications",
      "Data Scientist specializing in machine learning and analytics",
      "UX Designer creating user-centered digital experiences"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    updateData({ headline: randomSuggestion });
  };

  const generateBioSuggestion = () => {
    const bioSuggestions = [
      "Experienced professional with a track record of delivering results in fast-paced environments. Passionate about innovation and continuous learning.",
      "Detail-oriented specialist with strong analytical skills and a collaborative approach to problem-solving. Committed to excellence and growth.",
      "Creative problem-solver with excellent communication skills. Thrives in team environments and enjoys tackling complex challenges."
    ];
    
    const randomBio = bioSuggestions[Math.floor(Math.random() * bioSuggestions.length)];
    updateData({ aboutMe: randomBio });
  };

  const isValid = data.headline.trim();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tell us about your professional self</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Professional Headline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headline" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Your Professional Title/Headline *
            </Label>
            <div className="flex gap-2">
              <Input
                id="headline"
                placeholder="e.g., Senior Product Manager, Full-Stack Developer"
                value={data.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                className="flex-1 transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will appear as your main professional title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutMe" className="flex items-center gap-2">
              Professional Summary
              <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <div className="space-y-2">
              <Textarea
                id="aboutMe"
                placeholder="Briefly describe your professional background, key strengths, and what drives you..."
                value={data.aboutMe}
                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary"
                maxLength={300}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {data.aboutMe.length}/300 characters
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example/Inspiration Card */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Need Inspiration?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Here are some examples of great professional headlines:
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" 
                   onClick={() => updateData({ headline: "Product Manager | B2B SaaS | Growth & Strategy" })}>
              Product Manager | B2B SaaS | Growth & Strategy
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"
                   onClick={() => updateData({ headline: "Full-Stack Developer | React & Node.js | AI Enthusiast" })}>
              Full-Stack Developer | React & Node.js | AI Enthusiast
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"
                   onClick={() => updateData({ headline: "UX Designer | Mobile & Web | User Research" })}>
              UX Designer | Mobile & Web | User Research
            </Badge>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ProfessionalSummaryStep;