import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to revolutionize your hiring process?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join hundreds of companies using AI to make better hiring decisions faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 h-auto font-semibold"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;