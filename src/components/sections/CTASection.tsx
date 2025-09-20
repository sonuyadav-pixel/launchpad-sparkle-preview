import { Button } from "@/components/ui/button";
// Temporarily disabled: import Section3DBackground from "@/components/3d/Section3DBackground";
import { AnimatedHeading, RotatingText } from "@/components/animations/TextAnimations";

const CTASection = () => {
  const subtitleTexts = [
    "Join hundreds of companies using AI to make better hiring decisions faster.",
    "Transform your recruitment process with intelligent AI technology.",
    "Start making smarter hiring decisions today with our AI platform."
  ];

  return (
    <section className="relative py-20 bg-gradient-to-r from-gradient-start to-gradient-end overflow-hidden">
      {/* Temporarily disabled 3D Background */}
      {/* <Section3DBackground type="cta" /> */}
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatedHeading className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to revolutionize your hiring process?
          </AnimatedHeading>
          
          <RotatingText 
            texts={subtitleTexts}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          />
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-pulse-glow group relative overflow-hidden shadow-2xl"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden shadow-2xl backdrop-blur-sm bg-white/10"
            >
              <span className="relative z-10">Schedule a Demo</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;