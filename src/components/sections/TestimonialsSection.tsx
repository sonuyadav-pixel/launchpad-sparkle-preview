import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

const testimonials = [
  {
    quote: "Interview4You transformed our hiring process. The AI insights helped us identify the perfect candidates 3x faster than traditional methods.",
    name: "Sarah Chen",
    title: "HR Director",
    company: "TechCorp",
    image: testimonial1
  },
  {
    quote: "As a candidate, the AI interview was surprisingly natural and engaging. I felt more prepared and confident throughout the process.",
    name: "Marcus Rodriguez", 
    title: "Software Engineer",
    company: "StartupXYZ",
    image: testimonial2
  },
  {
    quote: "The detailed candidate reports give us exactly what we need to make informed hiring decisions. It's a game-changer for our recruitment team.",
    name: "Emily Johnson",
    title: "Talent Acquisition Manager", 
    company: "GlobalTech",
    image: testimonial3
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-section-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border relative">
            <Quote className="w-12 h-12 text-primary/20 absolute top-6 left-6" />
            
            <div className="text-center space-y-6">
              <blockquote className="text-xl md:text-2xl text-card-foreground leading-relaxed font-medium">
                "{currentTestimonial.quote}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-muted-foreground">
                    {currentTestimonial.title}, {currentTestimonial.company}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Dots indicator */}
              <div className="flex items-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;