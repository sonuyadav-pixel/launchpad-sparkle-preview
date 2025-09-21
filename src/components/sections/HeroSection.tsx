import { Button } from "@/components/ui/button";
import interview4uLogo from "@/assets/interview4u-logo.png";
import Interactive3DBackground from "@/components/3d/Interactive3DBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center px-4 py-20">
      {/* Interactive 3D Background */}
      <Interactive3DBackground />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
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
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-white/90 font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Interviews
              </span>
            </h1>
            
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/90">
              Smarter Hiring
            </div>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transform your recruitment process with intelligent AI interviews that 
              generate actionable insights for better hiring decisions
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
              <div className="absolute inset-0 bg-gradient-to-r from-white to-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-xl px-10 py-8 h-auto font-bold backdrop-blur-sm bg-white/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z"></path>
                </svg>
                For HR Teams
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              { icon: "🤖", title: "AI-Driven", desc: "Smart adaptive questions" },
              { icon: "📊", title: "Data Insights", desc: "Actionable feedback reports" },
              { icon: "⚡", title: "Fast Process", desc: "Minutes, not hours" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce-gentle">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm font-medium">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;