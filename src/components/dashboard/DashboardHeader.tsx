import { Button } from "@/components/ui/button";
import { Menu, LogOut, DollarSign, PanelLeftClose, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

interface DashboardHeaderProps {
  onOpenPricing: () => void;
  onToggleSidebar: () => void;
  onCollapseSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export const DashboardHeader = ({ onOpenPricing, onToggleSidebar, onCollapseSidebar, sidebarCollapsed }: DashboardHeaderProps) => {
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
          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Desktop collapse toggle */}
          {onCollapseSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapseSidebar}
              className="hidden lg:flex"
            >
              {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          )}
          
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
          
          <Logo size="md" />
          
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