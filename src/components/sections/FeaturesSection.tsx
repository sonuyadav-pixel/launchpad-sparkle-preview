import React, { useState, useEffect } from "react";
import { Brain, Target, BarChart, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
// Temporarily disabled: import Section3DBackground from "@/components/3d/Section3DBackground";
import { AnimatedHeading, RotatingText, MultiLineAnimatedText } from "@/components/animations/TextAnimations";
import featureAiQuestions from "@/assets/feature-ai-questions.jpg";
import featureScoring from "@/assets/feature-scoring.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";
import featureIntegrations from "@/assets/feature-integrations.jpg";

const features = [
  {
    icon: Brain,
    title: "Adaptive AI Questions",
    shortDescription: "Smart questions that adapt in real-time",
    description: "Our AI dynamically adjusts interview questions based on candidate responses and role requirements, ensuring relevant and engaging conversations.",
    image: featureAiQuestions,
    benefits: ["Real-time adaptation", "Role-specific questions", "Natural conversation flow"]
  },
  {
    icon: Target,
    title: "Candidate Scoring & Insights",
    shortDescription: "Comprehensive candidate evaluation",
    description: "Advanced AI algorithms provide detailed scoring on technical skills, communication abilities, and problem-solving approaches with actionable insights.",
    image: featureScoring,
    benefits: ["Skill assessment", "Communication analysis", "Detailed reports"]
  },
  {
    icon: BarChart,
    title: "HR Dashboard",
    shortDescription: "Centralized candidate management",
    description: "Intuitive dashboard for HR teams to view comprehensive feedback, filter candidates by skills, and export detailed reports for informed decisions.",
    image: featureDashboard,
    benefits: ["Candidate filtering", "Export reports", "Team collaboration"]
  },
  {
    icon: Zap,
    title: "Seamless Integrations",
    shortDescription: "Connect with your existing tools",
    description: "Effortlessly integrate with your current ATS, receive Slack notifications, and automate email workflows for a streamlined hiring process.",
    image: featureIntegrations,
    benefits: ["ATS integration", "Slack notifications", "Email automation"]
  }
];

const FeaturesSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const subtitleTexts = [
    "Powerful tools designed to revolutionize your hiring process",
    "Advanced AI capabilities that transform recruitment",
    "Intelligent features for smarter hiring decisions"
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToFeature = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentFeature(index);
  };

  return (
    <section className="relative py-20 bg-section-light overflow-hidden">
      {/* Temporarily disabled 3D Background */}
      {/* <Section3DBackground type="features" /> */}
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Features You'll Love
          </AnimatedHeading>
          <RotatingText 
            texts={subtitleTexts}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </div>
        
        {/* Main Feature Carousel */}
        <div className="relative max-w-7xl mx-auto group">
          <div className="bg-card/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border hover:shadow-3xl transition-all duration-500 group-hover:shadow-primary/20">
            <div className="grid lg:grid-cols-5 min-h-[600px]">
              {/* Image Side - Takes up 3 columns */}
              <div className="lg:col-span-3 relative bg-gradient-to-br from-primary/5 to-accent/10 p-8 flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-700">
                    <img
                      src={features[currentFeature].image}
                      alt={features[currentFeature].title}
                      className="w-full h-auto animate-scale-in transform hover:scale-105 transition-transform duration-700 group-hover:scale-110"
                      key={currentFeature}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Feature Icon Overlay */}
                  <div className="absolute -top-4 -right-4 bg-primary/90 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center animate-pulse-glow shadow-2xl hover:scale-110 transition-transform duration-300">
                    {React.createElement(features[currentFeature].icon, { 
                      className: "w-8 h-8 text-white" 
                    })}
                  </div>
                </div>
                
                {/* Decorative elements with enhanced shadows */}
                <div className="absolute top-12 left-12 w-20 h-20 bg-primary/10 rounded-full animate-float blur-sm shadow-lg"></div>
                <div className="absolute bottom-12 right-12 w-16 h-16 bg-accent/20 rounded-full animate-bounce-gentle blur-sm shadow-md"></div>
              </div>
              
              {/* Content Side - Takes up 2 columns */}
              <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-background to-primary/5">
                <div key={currentFeature} className="animate-fade-in space-y-6">
                  {/* Feature Number */}
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold text-primary">
                      Feature {currentFeature + 1}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <AnimatedHeading>
                    <h3 className="text-2xl lg:text-3xl font-bold text-card-foreground">
                      {features[currentFeature].title}
                    </h3>
                  </AnimatedHeading>
                  
                  {/* Short Description */}
                  <p className="text-lg font-medium text-primary">
                    {features[currentFeature].shortDescription}
                  </p>
                  
                  {/* Detailed Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {features[currentFeature].description}
                  </p>
                  
                  {/* Benefits List */}
                  <MultiLineAnimatedText 
                    lines={features[currentFeature].benefits}
                    className="space-y-2"
                    lineDelay={200}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevFeature}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-primary/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextFeature}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-primary/30"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Feature Navigation Tabs */}
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => goToFeature(index)}
              className={`group relative px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                index === currentFeature 
                  ? 'bg-primary text-primary-foreground scale-105 shadow-2xl shadow-primary/30' 
                  : 'bg-background border border-border hover:border-primary/50 hover:scale-105 hover:shadow-primary/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {React.createElement(feature.icon, { 
                  className: `w-4 h-4 ${index === currentFeature ? 'text-primary-foreground' : 'text-primary'}` 
                })}
                <span className="text-sm font-medium hidden sm:inline">
                  {feature.title}
                </span>
              </div>
              
              {index === currentFeature && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-6 max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Feature {currentFeature + 1}</span>
            <span>{features.length} Total</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out rounded-full shadow-lg"
              style={{ width: `${((currentFeature + 1) / features.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;