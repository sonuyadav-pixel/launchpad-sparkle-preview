import { Button } from "@/components/ui/button";
import { Menu, LogOut, DollarSign, PanelLeftClose, PanelLeft, Video, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { sessionManager } from "@/utils/SessionManager";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FirstNameModal } from "@/components/profile/FirstNameModal";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  onOpenPricing: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed?: boolean; // Keep for potential future use
}

export const DashboardHeader = ({ onOpenPricing, onToggleSidebar, sidebarCollapsed }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showFirstNameModal, setShowFirstNameModal] = useState(false);
  
  const { profile, user, loading, updateProfile, hasFirstName } = useUserProfile();

  // Check for active session periodically
  useEffect(() => {
    const checkActiveSession = () => {
      const hasSession = sessionManager.hasActiveSession();
      const sessionId = sessionManager.getActiveSessionId();
      setHasActiveSession(hasSession);
      setActiveSessionId(sessionId);
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if we need to ask for first name
  useEffect(() => {
    if (!loading && user && !hasFirstName) {
      setShowFirstNameModal(true);
    }
  }, [loading, user, hasFirstName]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleUpdateFirstName = async (firstName: string) => {
    await updateProfile({ first_name: firstName });
  };

  const handleReturnToInterview = () => {
    if (activeSessionId) {
      navigate(`/interview?session=${activeSessionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Logo in top left */}
          <Logo size="md" />
          
          {/* Mobile toggle */}
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
              Hi, <span className="text-primary">
                {loading ? "..." : (profile?.first_name || "there")}
              </span>
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
      
      <FirstNameModal 
        open={showFirstNameModal}
        onClose={() => setShowFirstNameModal(false)}
        onSubmit={handleUpdateFirstName}
      />
    </header>
  );
};