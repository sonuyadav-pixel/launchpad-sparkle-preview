import { User, MessageCircle, BarChart3, Monitor } from "lucide-react";

const steps = [
  {
    icon: User,
    title: "Candidate Profile",
    description: "Candidate uploads resume or LinkedIn profile and fills basic info."
  },
  {
    icon: MessageCircle,
    title: "AI Interview",
    description: "AI bot conducts adaptive, role-specific interview."
  },
  {
    icon: BarChart3,
    title: "Feedback Analysis",
    description: "AI evaluates answers, scores skills, communication, problem-solving."
  },
  {
    icon: Monitor,
    title: "HR Dashboard",
    description: "Structured feedback is sent to HR for faster, better hiring."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From candidate interview to actionable HR feedback in minutes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative animate-scale-in group" 
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Card */}
              <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group-hover:border-primary/20">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <step.icon className="w-8 h-8 text-primary group-hover:animate-bounce-gentle" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
                
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold animate-pulse-glow">
                  {index + 1}
                </div>
              </div>
              
              {/* Arrow (hidden on mobile, visible on desktop for non-last items) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 animate-fade-in">
                  <div className="w-8 h-0.5 bg-primary/30 animate-pulse"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary/30 rotate-45 translate-x-1 animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;