import React from "react";
import { User, MessageCircle, BarChart3, Monitor } from "lucide-react";
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
        
        {/* Timeline Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-primary to-primary/30 rounded-full hidden lg:block"></div>
          
          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                  <div className="bg-card rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="space-y-4">
                      {/* Step Number and Icon */}
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center animate-pulse-glow">
                          {React.createElement(step.icon, { 
                            className: "w-8 h-8 text-primary" 
                          })}
                        </div>
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm">
                          Step {index + 1}
                        </div>
                      </div>
                      
                      {/* Title and Description */}
                      <h3 className="text-2xl font-bold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {step.description}
                      </p>
                      <p className="text-card-foreground leading-relaxed">
                        {step.detailedDescription}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline Node */}
                <div className="relative z-10 hidden lg:block">
                  <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg animate-pulse-glow"></div>
                  <div className="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping"></div>
                </div>
                
                {/* Image */}
                <div className="flex-1">
                  <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-2xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full max-w-md mx-auto h-auto rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                    />
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-primary/10 rounded-full animate-float"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 bg-accent/20 rounded-full animate-bounce-gentle"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Completion Circle */}
          <div className="flex justify-center mt-16">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-primary/30 rounded-full animate-ping"></div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-primary whitespace-nowrap">
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