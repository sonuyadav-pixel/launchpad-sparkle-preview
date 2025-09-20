import { Linkedin, Twitter, Youtube } from "lucide-react";
import { AnimatedHeading, MultiLineAnimatedText } from "@/components/animations/TextAnimations";
import interview4uLogo from "@/assets/interview4u-logo.png";

const Footer = () => {
  const companyLinks = ["About", "Contact", "Privacy Policy", "Terms of Service"];

  return (
    <footer className="relative bg-section-dark text-white py-16 overflow-hidden">
      {/* Subtle 3D background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse shadow-2xl"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 border border-white/20 rounded-full animate-bounce-gentle shadow-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 border border-white/20 rounded-full animate-float shadow-lg"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 space-y-4 animate-fade-in-left">
            <img
              src={interview4uLogo}
              alt="Interview4You Logo"
              className="h-12 w-auto hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
            />
            <p className="text-white/80 max-w-md">
              AI-powered interview platform revolutionizing the hiring process for modern companies.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <AnimatedHeading delay={200}>
              <h4 className="font-semibold text-lg">Company</h4>
            </AnimatedHeading>
            <MultiLineAnimatedText 
              lines={companyLinks.map(link => (
                `<a href="#" class="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform hover:drop-shadow-lg">${link}</a>`
              ))}
              className="space-y-2"
              lineDelay={100}
            />
          </div>
          
          {/* Social Media */}
          <div className="space-y-4 animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
            <AnimatedHeading delay={400}>
              <h4 className="font-semibold text-lg">Follow Us</h4>
            </AnimatedHeading>
            <div className="flex space-x-4">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "YouTube" }
              ].map(({ icon: Icon, href, label }, index) => (
                <a 
                  key={label}
                  href={href} 
                  className="text-white/80 hover:text-white transition-all duration-300 p-3 rounded-lg hover:bg-white/10 hover:scale-110 group shadow-lg hover:shadow-2xl hover:shadow-white/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-5 h-5 group-hover:animate-bounce-gentle drop-shadow-lg" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center animate-fade-in">
          <p className="text-white/60 drop-shadow-lg">
            © 2025 Interview4You. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;