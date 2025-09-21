import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onOpenPricing={() => setIsPricingOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex">
        <DashboardSidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <DashboardContent 
          activeModule={activeModule}
          sidebarOpen={isSidebarOpen}
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