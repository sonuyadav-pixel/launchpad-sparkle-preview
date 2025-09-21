import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import interview4uLogo from "@/assets/interview4u-logo.png";
import AIGraphBackground from "@/components/3d/AIGraphBackground";
import AutoScrollingBackground from "@/components/backgrounds/AutoScrollingBackground";

const HeroSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoverDescIndex, setHoverDescIndex] = useState(0);

  const features = [
    { 
      icon: "🤖", 
      title: "AI-Driven", 
      defaultDesc: "Smart adaptive questions",
      descriptions: [
        "Smart adaptive questions",
        "Personalized interview flow",
        "Real-time conversation analysis",
        "Dynamic difficulty adjustment"
      ]
    },
    { 
      icon: "📊", 
      title: "Data Insights", 
      defaultDesc: "Actionable feedback reports",
      descriptions: [
        "Actionable feedback reports",
        "Comprehensive skill assessment",
        "Performance trend analysis",
        "Detailed competency mapping"
      ]
    },
    { 
      icon: "⚡", 
      title: "Fast Process", 
      defaultDesc: "Minutes, not hours",
      descriptions: [
        "Minutes, not hours",
        "Instant result generation",
        "Quick candidate screening",
        "Rapid feedback delivery"
      ]
    }
  ];

  useEffect(() => {
    if (hoveredFeature === null) return;

    const interval = setInterval(() => {
      setHoverDescIndex((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, [hoveredFeature]);

  const handleMouseEnter = (index: number) => {
    setHoveredFeature(index);
    setHoverDescIndex(0);
  };

  const handleMouseLeave = () => {
    setHoveredFeature(null);
    setHoverDescIndex(0);
  };
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center px-4 py-20">
      {/* Auto-scrolling AI Interview Background */}
      <AutoScrollingBackground />
      
      {/* AI Graphs Background */}
      <AIGraphBackground />
      
      {/* Brand Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20 animate-fade-in">
        <img
          src={interview4uLogo}
          alt="Interview4You Logo"
          className="h-16 w-auto hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Main Headline */}
          <div className="space-y-6">
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Interview Platform
              </span>
            </h1>
            
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/90">
              Smarter Hiring Decisions
            </div>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Conduct intelligent interviews with AI that analyzes candidate responses, 
              generates insights, and helps you identify top talent faster across all roles.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-xl px-10 py-8 h-auto font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-white/20 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Get Started Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-black to-black/90 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-1000 ease-out"></div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-xl px-10 py-8 h-auto font-bold backdrop-blur-sm bg-white/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3 group-hover:text-black transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z"></path>
                </svg>
                For HR Teams
              </span>
              <div className="absolute inset-0 bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-1000 ease-out"></div>
            </Button>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-black/90 transition-all duration-500 animate-fade-in cursor-pointer group"
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className={`text-3xl mb-3 transition-all duration-300 ${hoveredFeature === index ? 'scale-125' : 'scale-100'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-white group-hover:text-white font-bold text-lg mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/80 group-hover:text-white/90 text-sm transition-all duration-300">
                  {hoveredFeature === index ? feature.descriptions[hoverDescIndex] : feature.defaultDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default HeroSection;