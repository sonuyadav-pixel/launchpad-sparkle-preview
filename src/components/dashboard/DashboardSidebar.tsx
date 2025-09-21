import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Star, 
  FileText, 
  BookOpen, 
  Briefcase, 
  Sparkles,
  X
} from "lucide-react";
import { DashboardModule } from "@/pages/Dashboard";

const menuItems = [
  {
    group: "Home",
    items: [
      {
        id: "overview" as DashboardModule,
        label: "Overview",
        icon: LayoutDashboard,
        comingSoon: true,
      },
      {
        id: "interview" as DashboardModule,
        label: "Interview",
        icon: MessageSquare,
        description: "Start an AI interview session.",
      },
      {
        id: "calendar" as DashboardModule,
        label: "Calendar",
        icon: Calendar,
        comingSoon: true,
      },
      {
        id: "feedback" as DashboardModule,
        label: "Feedback",
        icon: Star,
        comingSoon: true,
      },
    ],
  },
  {
    group: "For You",
    items: [
      {
        id: "resume-builder" as DashboardModule,
        label: "Resume Builder",
        icon: FileText,
        description: "Create or update your professional resume.",
      },
      {
        id: "learning" as DashboardModule,
        label: "Learning",
        icon: BookOpen,
        description: "Upskill with curated learning content.",
      },
      {
        id: "jobs" as DashboardModule,
        label: "Jobs",
        icon: Briefcase,
        description: "Find and apply for jobs.",
      },
      {
        id: "interview-plus" as DashboardModule,
        label: "Interview+",
        icon: Sparkles,
        description: "Premium AI interview coaching and insights.",
        badge: "Pro",
      },
    ],
  },
];

interface DashboardSidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (module: DashboardModule) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar = ({
  activeModule,
  onModuleChange,
  isOpen,
  onClose,
}: DashboardSidebarProps) => {
  const handleItemClick = (moduleId: DashboardModule, comingSoon?: boolean) => {
    if (!comingSoon) {
      onModuleChange(moduleId);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile overlay - only show on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 h-[calc(100vh-4rem)] border-r bg-sidebar transition-all duration-300 ease-in-out lg:block",
          isOpen ? "block" : "hidden lg:block"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h3 className="text-lg font-semibold">Menu</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 p-4">
            {menuItems.map((group) => (
              <div key={group.group} className="space-y-3">
                <h3 className="text-sm font-medium text-sidebar-foreground/70 uppercase tracking-wide">
                  {group.group}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeModule === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleItemClick(item.id, item.comingSoon)}
                          disabled={item.comingSoon}
                          className={cn(
                            "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary"
                              : item.comingSoon
                              ? "text-sidebar-foreground/50 cursor-not-allowed"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                          title={item.description}
                        >
                          <Icon 
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive ? "text-primary" : "text-current"
                            )} 
                          />
                          <span className="flex-1">{item.label}</span>
                          
                          {item.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Soon
                            </Badge>
                          )}
                          
                          {item.badge && !item.comingSoon && (
                            <Badge variant="default" className="text-xs bg-primary">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};