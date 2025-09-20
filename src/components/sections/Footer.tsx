import { Linkedin, Twitter, Youtube } from "lucide-react";
import interview4uLogo from "@/assets/interview4u-logo.png";

const Footer = () => {
  return (
    <footer className="bg-section-dark text-white py-16 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 border border-white/20 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 border border-white/20 rounded-full animate-float"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 space-y-4 animate-fade-in-left">
            <img
              src={interview4uLogo}
              alt="Interview4You Logo"
              className="h-12 w-auto hover:scale-105 transition-transform duration-300"
            />
            <p className="text-white/80 max-w-md">
              AI-powered interview platform revolutionizing the hiring process for modern companies.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-semibold text-lg">Company</h4>
            <ul className="space-y-2">
              {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link, index) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="space-y-4 animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
            <h4 className="font-semibold text-lg">Follow Us</h4>
            <div className="flex space-x-4">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "YouTube" }
              ].map(({ icon: Icon, href, label }, index) => (
                <a 
                  key={label}
                  href={href} 
                  className="text-white/80 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 hover:scale-110 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-5 h-5 group-hover:animate-bounce-gentle" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center animate-fade-in">
          <p className="text-white/60">
            © 2025 Interview4You. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;