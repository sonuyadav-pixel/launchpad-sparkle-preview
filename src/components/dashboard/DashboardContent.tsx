import { cn } from "@/lib/utils";
import { DashboardModule } from "@/pages/Dashboard";
import { InterviewModule } from "./modules/InterviewModule";
import { ComingSoonModule } from "./modules/ComingSoonModule";
import { ResumeBuilderModule } from "./modules/ResumeBuilderModule";
import { LearningModule } from "./modules/LearningModule";
import { JobsModule } from "./modules/JobsModule";
import { InterviewPlusModule } from "./modules/InterviewPlusModule";

interface DashboardContentProps {
  activeModule: DashboardModule;
  sidebarOpen: boolean;
}

export const DashboardContent = ({ activeModule, sidebarOpen }: DashboardContentProps) => {
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
        return <ComingSoonModule title="Calendar" description="Calendar integration is coming soon. Stay tuned for updates!" />;
      case "feedback":
        return <ComingSoonModule title="Feedback" description="Feedback system is coming soon. Stay tuned for updates!" />;
      default:
        return <InterviewModule />;
    }
  };

  return (
    <main 
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-0" : "lg:ml-0"
      )}
    >
      <div className="container mx-auto p-6 lg:p-8">
        {renderModule()}
      </div>
    </main>
  );
};