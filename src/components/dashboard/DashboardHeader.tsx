import { Button } from "@/components/ui/button";
import { Menu, LogOut, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import companyLogo from "@/assets/interview4u-logo.png";

interface DashboardHeaderProps {
  onOpenPricing: () => void;
  onToggleSidebar: () => void;
}

export const DashboardHeader = ({ onOpenPricing, onToggleSidebar }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Add sign out logic here
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-foreground">
              Hi, <span className="text-primary">John</span>
            </h2>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPricing}
            className="hidden sm:inline-flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Pricing
          </Button>
          
          <button 
            onClick={handleLogoClick}
            className="flex items-center"
          >
            <img 
              src={companyLogo} 
              alt="Interview4U" 
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};