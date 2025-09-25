import { useEffect, useState } from 'react';
import { Brain, MessageSquare, User, Clock, Sparkles, Bot, Search, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InterviewLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export const InterviewLoadingScreen = ({ 
  title = "Loading Interview History", 
  subtitle = "Analyzing your AI interview sessions..." 
}: InterviewLoadingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseIcons, setPulseIcons] = useState<Set<number>>(new Set());

  const loadingSteps = [
    { icon: Search, text: "Scanning interview database", delay: 0 },
    { icon: Brain, text: "Processing AI interactions", delay: 800 },
    { icon: BarChart3, text: "Calculating performance metrics", delay: 1600 },
    { icon: MessageSquare, text: "Loading conversation history", delay: 2400 }
  ];

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    loadingSteps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
        setPulseIcons(prev => new Set([...prev, index]));
      }, step.delay);
      intervals.push(timeout);
    });

    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Loading Card */}
        <Card className="p-8 text-center bg-card/80 backdrop-blur-sm border border-primary/20 shadow-2xl">
          {/* Animated AI Brain Icon */}
          <div className="relative mb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-white animate-fade-in" />
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 animate-spin">
              <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: '0s' }} />
              <Bot className="absolute top-1/2 right-0 transform -translate-y-1/2 h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <MessageSquare className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: '1s' }} />
              <User className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>

          {/* Title and Subtitle */}
          <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
            {title}
          </h2>
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>

          {/* Progress Indicator */}
          <div className="space-y-4">
            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-800 ease-out"
                style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>

            {/* Loading Steps */}
            <div className="space-y-3">
              {loadingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index <= currentStep;
                const isPulsing = pulseIcons.has(index);
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                      isActive 
                        ? 'bg-primary/10 text-foreground shadow-sm' 
                        : 'text-muted-foreground/50'
                    }`}
                    style={{ 
                      animationDelay: `${step.delay}ms`,
                      opacity: isActive ? 1 : 0.3
                    }}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted/10'
                    } ${isPulsing ? 'animate-pulse' : ''}`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      isActive ? 'animate-fade-in' : ''
                    }`}>
                      {step.text}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Quote */}
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border-l-4 border-primary animate-fade-in" style={{ animationDelay: '2s' }}>
            <p className="text-sm italic text-muted-foreground">
              "Every interview is a step towards your perfect career match."
            </p>
            <p className="text-xs text-primary mt-1 font-medium">
              — AI Interview Assistant
            </p>
          </div>

          {/* Processing indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '2.5s' }}>
            <Clock className="h-4 w-4 animate-spin" />
            <span>Preparing your personalized insights...</span>
          </div>
        </Card>

        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};