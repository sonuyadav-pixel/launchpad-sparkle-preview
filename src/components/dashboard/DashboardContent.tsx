import { cn } from "@/lib/utils";
import { DashboardModule } from "@/pages/Dashboard";
import InterviewModule from "./modules/InterviewModule";
import { ComingSoonModule } from "./modules/ComingSoonModule";
import { ResumeBuilderModule } from "./modules/ResumeBuilderModule";
import { LearningModule } from "./modules/LearningModule";
import { JobsModule } from "./modules/JobsModule";
import { InterviewPlusModule } from "./modules/InterviewPlusModule";
import CalendarModule from "./modules/CalendarModule";

interface DashboardContentProps {
  activeModule: DashboardModule;
  sidebarOpen: boolean;
  sidebarCollapsed?: boolean;
}

export const DashboardContent = ({ activeModule, sidebarOpen, sidebarCollapsed }: DashboardContentProps) => {
  const renderModule = () => {
    switch (activeModule) {
      case "interview":
        return <InterviewModule />;
      case "resume-builder":
        return <ResumeBuilderModule />;
      case "learning":
        return <LearningModule />;
      case "jobs":
        return <JobsModule />;
      case "interview-plus":
        return <InterviewPlusModule />;
      case "overview":
        return <ComingSoonModule title="Overview" description="Dashboard overview is coming soon. Stay tuned for updates!" />;
      case "calendar":
        return <CalendarModule />;
      case "feedback":
        return <ComingSoonModule title="Feedback" description="Feedback system is coming soon. Stay tuned for updates!" />;
      default:
        return <InterviewModule />;
    }
  };

  return (
    <main className="flex-1 overflow-auto">
    
      <div className="container mx-auto p-6 lg:p-8 bg-primary/5 rounded-lg">
        {renderModule()}
      </div>
    </main>
  );
};