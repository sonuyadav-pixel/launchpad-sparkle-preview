import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Clock, Star } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs">✨</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Let's Build Your Interview Profile 🚀
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tell us about your professional journey so our AI can create a personalized interview experience tailored just for you.
        </p>
      </div>

      {/* Benefits Cards */}
      <div className="grid md:grid-cols-3 gap-6 my-12">
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Personalized Questions</h3>
            <p className="text-sm text-muted-foreground">
              AI generates interview questions based on your experience and target roles
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Smart Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed analysis of your responses with improvement suggestions
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your improvement over time with detailed analytics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What We'll Cover */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">What We'll Cover</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Basic Information',
            'Professional Summary',
            'Work Experience',
            'Education',
            'Skills & Expertise',
            'Career Preferences',
            'Resume Upload',
            'Profile Photo'
          ].map((item) => (
            <Badge key={item} variant="secondary" className="px-3 py-1">
              {item}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Takes about 5-10 minutes • You can save and continue later
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-4">
        <Button 
          onClick={onNext}
          size="lg"
          className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Start Building My Profile
        </Button>
        
        <p className="text-xs text-muted-foreground">
          We respect your privacy. Your data is secure and never shared.
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;