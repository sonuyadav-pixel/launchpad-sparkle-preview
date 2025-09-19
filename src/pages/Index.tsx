import heroInterview from "@/assets/hero-interview.png";
import companyLogo from "@/assets/company-logo.png";
import { Mail, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroInterview}
        alt="Professional interview scene with candidates and interviewers"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={companyLogo}
              alt="Interview4You Logo"
              className="h-24 w-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Main Content */}
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-bold text-white drop-shadow-2xl">
              coming soon...
            </h1>
            <p className="text-2xl text-white/90 drop-shadow-lg">
              Interview4you
            </p>
          </div>
          
          {/* Contact Section */}
          <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6">
            <h2 className="text-3xl font-semibold text-white mb-6">Contact Us</h2>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-3 text-white">
                <Mail className="h-5 w-5" />
                <a href="mailto:sonu@interview4you.in" className="hover:text-blue-300 transition-colors">
                  sonu@interview4you.in
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-white">
                <Mail className="h-5 w-5" />
                <a href="mailto:rohan@interview4you.in" className="hover:text-blue-300 transition-colors">
                  rohan@interview4you.in
                </a>
              </div>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center gap-6 pt-6">
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-pink-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-blue-600 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
