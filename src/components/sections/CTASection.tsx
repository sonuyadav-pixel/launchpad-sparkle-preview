import { Button } from "@/components/ui/button";
import Section3DDecor from "@/components/3d/Section3DDecor";
import { AnimatedHeading, RotatingText } from "@/components/animations/TextAnimations";

const CTASection = () => {
  const subtitleTexts = [
    "Join hundreds of companies using AI to make better hiring decisions faster.",
    "Transform your recruitment process with intelligent AI technology.",
    "Start making smarter hiring decisions today with our AI platform."
  ];

  return (
    <section className="relative py-20 bg-section-lightBlue overflow-hidden">
      {/* 3D Decorative Elements */}
      <Section3DDecor sectionType="cta" />
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatedHeading className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            Ready to revolutionize your hiring process?
          </AnimatedHeading>
          
          <RotatingText 
            texts={subtitleTexts}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-pulse-glow group relative overflow-hidden shadow-2xl"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden shadow-2xl backdrop-blur-sm"
            >
              <span className="relative z-10">Schedule a Demo</span>
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;