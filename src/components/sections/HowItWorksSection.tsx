import React from "react";
import { User, MessageCircle, BarChart3, Monitor } from "lucide-react";
import Section3DDecor from "@/components/3d/Section3DDecor";
import { AnimatedHeading, RotatingText, MultiLineAnimatedText } from "@/components/animations/TextAnimations";
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
  const subtitleTexts = [
    "From candidate interview to actionable HR feedback in minutes.",
    "Streamline your hiring process with AI-powered automation.",
    "Transform recruitment with intelligent interview technology."
  ];

  return (
    <section className="relative py-12 md:py-20 bg-background overflow-hidden">
      {/* 3D Decorative Elements */}
      <Section3DDecor sectionType="timeline" />
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </AnimatedHeading>
          <RotatingText 
            texts={subtitleTexts}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </div>
        
        {/* Timeline Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-primary to-primary/30 rounded-full hidden lg:block shadow-lg"></div>
          
          {/* Steps */}
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } animate-fade-in-up group`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                  <div className="bg-card rounded-2xl p-6 md:p-8 shadow-2xl border hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group-hover:shadow-primary/20 backdrop-blur-sm bg-card/90">
                    <div className="space-y-4">
                      {/* Step Number and Icon */}
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center animate-pulse-glow group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-lg">
                          {React.createElement(step.icon, { 
                            className: "w-8 h-8 text-primary group-hover:animate-bounce-gentle" 
                          })}
                        </div>
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300">
                          Step {index + 1}
                        </div>
                      </div>
                      
                      {/* Title and Description */}
                      <AnimatedHeading delay={index * 100}>
                        <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                      </AnimatedHeading>
                      
                      <MultiLineAnimatedText 
                        lines={[
                          step.description,
                          step.detailedDescription
                        ]}
                        className="space-y-2"
                        lineDelay={300}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Timeline Node */}
                <div className="relative z-20 hidden lg:block">
                  <div className="w-8 h-8 bg-primary rounded-full border-4 border-background shadow-2xl animate-pulse-glow group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="absolute inset-0 w-8 h-8 bg-primary/30 rounded-full animate-ping group-hover:animate-pulse"></div>
                </div>
                
                {/* Image */}
                <div className="flex-1">
                  <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full max-w-md mx-auto h-auto rounded-xl shadow-lg hover:scale-105 transition-transform duration-500 group-hover:shadow-2xl"
                    />
                    {/* Decorative elements with enhanced shadows */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-primary/10 rounded-full animate-float shadow-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 bg-accent/20 rounded-full animate-bounce-gentle shadow-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Completion Circle */}
          <div className="flex justify-center mt-16">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow hover:scale-110 transition-all duration-300 group-hover:shadow-primary/50">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full animate-ping group-hover:animate-pulse"></div>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Complete Process
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;