import { Button } from "@/components/ui/button";
import heroAiInterview from "@/assets/hero-ai-interview.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center px-4 py-20">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="space-y-8 text-center lg:text-left animate-fade-in-left">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              AI-Powered Interviews.{" "}
              <span className="text-white/90">Smarter Hiring.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              Let our AI interview candidates and generate actionable feedback for HR, 
              saving time and improving hiring decisions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-xl animate-pulse-glow"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              For HR
            </Button>
          </div>
        </div>
        
        {/* Illustration */}
        <div className="relative animate-fade-in-right">
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-float">
            <img
              src={heroAiInterview}
              alt="AI chatbot conducting interview with candidate"
              className="w-full h-auto rounded-lg"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/20 rounded-full blur-xl animate-bounce-gentle"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/30 rounded-full blur-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;