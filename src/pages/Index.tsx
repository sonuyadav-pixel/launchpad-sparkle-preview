import heroInterview from "@/assets/hero-interview.png";
import interview4uLogo from "@/assets/interview4u-logo.png";
import { Mail, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroInterview}
        alt="Professional interview scene with candidates and interviewers"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/40">
        {/* Header with logo */}
        <header className="absolute top-0 right-0 p-6 z-10">
          <img
            src={interview4uLogo}
            alt="Interview4You Logo"
            className="h-16 w-auto drop-shadow-lg"
          />
        </header>
        
        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl lg:text-8xl font-bold text-white drop-shadow-2xl">
              coming soon...
            </h1>
            <p className="text-2xl text-white/90 drop-shadow-lg">
              Interview4you
            </p>
          </div>
        </div>
        
        {/* Contact Section - Bottom Center */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white text-center">Contact Us</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-white">
                <Mail className="h-4 w-4" />
                <a href="mailto:sonu@interview4you.in" className="hover:text-blue-300 transition-colors text-sm">
                  sonu@interview4you.in
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Mail className="h-4 w-4" />
                <a href="mailto:rohan@interview4you.in" className="hover:text-blue-300 transition-colors text-sm">
                  rohan@interview4you.in
                </a>
              </div>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center gap-4 pt-2">
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-pink-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
