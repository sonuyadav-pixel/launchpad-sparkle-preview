import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Section3DBackground from "@/components/3d/Section3DBackground";
import { AnimatedHeading, RotatingText } from "@/components/animations/TextAnimations";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const subtitleTexts = [
    "Real experiences from companies and candidates",
    "Success stories that speak for themselves",
    "Trusted by professionals worldwide"
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative py-20 bg-section-light">
      {/* 3D Background */}
      <Section3DBackground type="testimonials" />
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </AnimatedHeading>
          <RotatingText 
            texts={subtitleTexts}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl border relative animate-scale-in hover:shadow-3xl transition-all duration-500 group hover:shadow-primary/20">
            <Quote className="w-12 h-12 text-primary/20 absolute top-6 left-6 animate-pulse group-hover:scale-110 transition-transform duration-300" />
            
            <div className="text-center space-y-6" key={currentIndex}>
              <blockquote className="text-xl md:text-2xl text-card-foreground leading-relaxed font-medium animate-fade-in">
                "{currentTestimonial.quote}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4 animate-fade-in-up">
                <div className="relative group cursor-pointer">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 animate-pulse-glow shadow-lg hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
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
                className="rounded-full hover:scale-110 transition-all duration-200 hover:border-primary shadow-lg hover:shadow-xl hover:shadow-primary/30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Dots indicator */}
              <div className="flex items-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                      index === currentIndex 
                        ? 'bg-primary scale-125 animate-pulse-glow shadow-primary/50' 
                        : 'bg-muted hover:bg-primary/50 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full hover:scale-110 transition-all duration-200 hover:border-primary shadow-lg hover:shadow-xl hover:shadow-primary/30"
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