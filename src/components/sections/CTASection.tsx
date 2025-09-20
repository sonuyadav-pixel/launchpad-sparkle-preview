import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-gradient-start to-gradient-end relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce-gentle"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to revolutionize your hiring process?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join hundreds of companies using AI to make better hiring decisions faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-pulse-glow group relative overflow-hidden"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 h-auto font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden"
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