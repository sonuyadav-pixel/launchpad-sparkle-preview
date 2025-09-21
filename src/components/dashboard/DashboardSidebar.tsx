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
  ChevronLeft,
  PanelLeftClose,
  PanelLeft
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
        label: "Interview History",
        icon: Star,
        description: "View your past interview sessions and feedback.",
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void; // Add toggle collapse function
}

export const DashboardSidebar = ({
  activeModule,
  onModuleChange,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const handleItemClick = (moduleId: DashboardModule, comingSoon?: boolean) => {
    if (!comingSoon) {
      onModuleChange(moduleId);
      // Don't auto-close sidebar - let user control it manually
    }
  };

  console.log('DashboardSidebar render:', { isCollapsed, isOpen });

  return (
    <>
      {/* Removed mobile overlay that was blocking clicks on main content */}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "h-[calc(100vh-4rem)] border-r bg-sidebar transition-all duration-300 ease-in-out",
          isCollapsed 
            ? "w-16" // Mini sidebar width
            : "w-64", // Full sidebar width
          // Show logic: always show when collapsed (mini), otherwise follow isOpen
          isCollapsed 
            ? "block" 
            : isOpen 
              ? "block" 
              : "hidden lg:block"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Toggle Mini Sidebar Button - Always visible at top */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && <h3 className="text-lg font-semibold">Menu</h3>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse to mini sidebar"}
            >
              {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-6",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {menuItems.map((group) => (
              <div key={group.group} className={cn(
                isCollapsed ? "space-y-1" : "space-y-3"
              )}>
                {/* Group label - only show when expanded */}
                {!isCollapsed && (
                  <h3 className="text-sm font-medium text-sidebar-foreground/70 uppercase tracking-wide">
                    {group.group}
                  </h3>
                )}
                <ul className={cn(
                  isCollapsed ? "space-y-1" : "space-y-1"
                )}>
                  {group.items.map((item) => {
                    const isActive = activeModule === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleItemClick(item.id, item.comingSoon)}
                          disabled={item.comingSoon}
                          className={cn(
                            "group relative flex w-full items-center gap-3 rounded-lg text-left text-sm font-medium transition-all duration-200",
                            isCollapsed ? "p-3 justify-center" : "px-3 py-2.5",
                            isActive
                              ? isCollapsed
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary"
                              : item.comingSoon
                              ? "text-sidebar-foreground/50 cursor-not-allowed"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                          title={isCollapsed ? item.label : item.description}
                        >
                          <Icon 
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive 
                                ? isCollapsed 
                                  ? "text-primary-foreground" 
                                  : "text-primary"
                                : "text-current"
                            )} 
                          />
                          {/* Text and badges - only show when expanded */}
                          {!isCollapsed && (
                            <>
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
                            </>
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