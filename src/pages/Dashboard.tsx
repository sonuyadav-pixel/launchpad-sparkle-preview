import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PricingModal } from "@/components/dashboard/PricingModal";
import { FeedbackModal } from "@/components/dashboard/FeedbackModal";

export type DashboardModule = 
  | "overview" 
  | "interview" 
  | "calendar" 
  | "feedback" 
  | "resume-builder" 
  | "learning" 
  | "jobs" 
  | "interview-plus";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModule, setActiveModule] = useState<DashboardModule>("interview");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Check for feedback parameter on mount
  useEffect(() => {
    const showFeedback = searchParams.get('feedback');
    if (showFeedback === 'true') {
      setIsFeedbackOpen(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  console.log('Dashboard render:', { isSidebarOpen, isSidebarCollapsed });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onOpenPricing={() => setIsPricingOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        // Removed onCollapseSidebar - now handled in sidebar itself
        sidebarCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex">
        <DashboardSidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <DashboardContent 
          activeModule={activeModule}
          sidebarOpen={isSidebarOpen}
          sidebarCollapsed={isSidebarCollapsed}
        />
      </div>

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

export default Dashboard;