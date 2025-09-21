import { Button } from "@/components/ui/button";
import { Menu, LogOut, DollarSign, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { sessionManager } from "@/utils/SessionManager";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FirstNamePrompt } from "./FirstNamePrompt";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  onOpenPricing: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed?: boolean;
}

export const DashboardHeader = ({ onOpenPricing, onToggleSidebar, sidebarCollapsed }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showFirstNamePrompt, setShowFirstNamePrompt] = useState(false);
  const [savingName, setSavingName] = useState(false);
  
  const { profile, user, loading, updateProfile } = useUserProfile();

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

  // Show first name prompt if user doesn't have a first name
  useEffect(() => {
    if (!loading && profile && user && !profile.first_name) {
      setShowFirstNamePrompt(true);
    }
  }, [profile, user, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleFirstNameSubmit = async (firstName: string) => {
    setSavingName(true);
    try {
      await updateProfile({ first_name: firstName });
      setShowFirstNamePrompt(false);
    } catch (error) {
      console.error('Error saving first name:', error);
    } finally {
      setSavingName(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
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
                {loading ? '...' : profile?.first_name || 'there'}
              </span>
            </h2>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/feedback')}
            className="hidden sm:inline-flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Interview History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPricing}
            className="hidden md:inline-flex items-center gap-2"
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
      
      <FirstNamePrompt
        open={showFirstNamePrompt}
        onSubmit={handleFirstNameSubmit}
        loading={savingName}
      />
    </header>
  );
};