import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm">✨</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Let&apos;s Build Your Interview Profile
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Create your personalized interview experience in just a few simple steps
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-6">
        <Button 
          onClick={onNext}
          size="lg"
          className="px-12 py-4 text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:bg-black hover:from-black hover:to-black transition-all duration-300"
        >
          Start Building
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;