import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PricingModal } from "@/components/dashboard/PricingModal";

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
  const [activeModule, setActiveModule] = useState<DashboardModule>("interview");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    </div>
  );
};

export default Dashboard;