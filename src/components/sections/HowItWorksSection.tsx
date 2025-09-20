import React, { useState, useEffect } from "react";
import { User, MessageCircle, BarChart3, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import step1Profile from "@/assets/step-1-profile.jpg";
import step2Interview from "@/assets/step-2-interview.jpg";
import step3Analysis from "@/assets/step-3-analysis.jpg";
import step4Dashboard from "@/assets/step-4-dashboard.jpg";

const steps = [
  {
    icon: User,
    title: "Candidate Profile",
    description: "Candidate uploads resume or LinkedIn profile and fills basic info.",
    detailedDescription: "Our intelligent system seamlessly processes resumes, LinkedIn profiles, and basic candidate information to create comprehensive profiles.",
    image: step1Profile
  },
  {
    icon: MessageCircle,
    title: "AI Interview",
    description: "AI bot conducts adaptive, role-specific interview.",
    detailedDescription: "Advanced AI conducts natural, conversational interviews that adapt in real-time based on the candidate's responses and role requirements.",
    image: step2Interview
  },
  {
    icon: BarChart3,
    title: "Feedback Analysis",
    description: "AI evaluates answers, scores skills, communication, problem-solving.",
    detailedDescription: "Sophisticated AI algorithms analyze responses to provide detailed insights on technical skills, communication abilities, and problem-solving approach.",
    image: step3Analysis
  },
  {
    icon: Monitor,
    title: "HR Dashboard",
    description: "Structured feedback is sent to HR for faster, better hiring.",
    detailedDescription: "Comprehensive dashboard provides HR teams with actionable insights, detailed reports, and data-driven recommendations for informed hiring decisions.",
    image: step4Dashboard
  }
];

const HowItWorksSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextStep = () => {
    setIsAutoPlaying(false);
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setIsAutoPlaying(false);
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToStep = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentStep(index);
  };

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From candidate interview to actionable HR feedback in minutes.
          </p>
        </div>
        
        {/* Main Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border">
            <div className="grid lg:grid-cols-2 min-h-[500px]">
              {/* Image Side */}
              <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-8 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <img
                    src={steps[currentStep].image}
                    alt={steps[currentStep].title}
                    className="w-full h-auto rounded-2xl shadow-lg animate-scale-in"
                    key={currentStep}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl"></div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-primary/10 rounded-full animate-float"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 bg-accent/20 rounded-full animate-bounce-gentle"></div>
              </div>
              
              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div key={currentStep} className="animate-fade-in">
                  {/* Step Number and Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center animate-pulse-glow">
                      {React.createElement(steps[currentStep].icon, { 
                        className: "w-8 h-8 text-primary" 
                      })}
                    </div>
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm">
                      Step {currentStep + 1}
                    </div>
                  </div>
                  
                  {/* Title and Description */}
                  <h3 className="text-2xl lg:text-3xl font-bold text-card-foreground mb-4">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    {steps[currentStep].description}
                  </p>
                  <p className="text-card-foreground leading-relaxed">
                    {steps[currentStep].detailedDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevStep}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextStep}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-center mt-8 gap-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`group relative transition-all duration-300 ${
                index === currentStep 
                  ? 'scale-110' 
                  : 'hover:scale-105'
              }`}
            >
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-primary animate-pulse-glow scale-125' 
                  : 'bg-muted hover:bg-primary/50'
              }`} />
              {index === currentStep && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary/30 animate-ping"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;