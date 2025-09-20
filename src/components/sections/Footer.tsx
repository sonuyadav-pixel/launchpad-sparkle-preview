import { Linkedin, Twitter, Youtube } from "lucide-react";
import interview4uLogo from "@/assets/interview4u-logo.png";

const Footer = () => {
  return (
    <footer className="bg-section-dark text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 space-y-4">
            <img
              src={interview4uLogo}
              alt="Interview4You Logo"
              className="h-12 w-auto"
            />
            <p className="text-white/80 max-w-md">
              AI-powered interview platform revolutionizing the hiring process for modern companies.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/60">
            © 2025 Interview4You. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;