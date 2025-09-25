import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, Trophy, Users, TrendingUp } from "lucide-react";

const ProductValueProposition = () => {
  const valueProps = [
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Smart feedback on responses and communication",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      badge: "Smart"
    },
    {
      icon: Target,
      title: "Custom Questions",
      description: "Questions tailored to your role",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      badge: "Adaptive"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Real-time scoring and tips",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      badge: "Fast"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor improvement over time",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      badge: "Growth"
    },
    {
      icon: Users,
      title: "Expert Designed",
      description: "Created by hiring professionals",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      badge: "Expert"
    },
    {
      icon: TrendingUp,
      title: "Detailed Reports",
      description: "Insights on strengths and gaps",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      badge: "Insights"
    }
  ];

  return (
    <Card className="mt-6">
      <CardContent className="p-6 relative overflow-hidden">
        {/* Floating 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-8 w-16 h-16 bg-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-8 left-12 w-12 h-12 bg-accent/10 rounded-full animate-bounce-gentle"></div>
          <div className="absolute top-1/2 right-4 w-8 h-8 bg-secondary/10 rounded-full animate-pulse"></div>
        </div>
        
        <div className="text-center mb-6 relative z-10">
          <h3 className="text-xl font-semibold mb-2 animate-fade-in">AI Interview Platform</h3>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Transform your interview skills with AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {valueProps.map((prop, index) => {
            const IconComponent = prop.icon;
            return (
              <div 
                key={index}
                className="group p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transform-gpu perspective-1000 animate-scale-in cursor-pointer"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) rotateX(5deg) rotateY(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg)';
                }}
              >
                <div className="flex items-start gap-3 relative">
                  <div className={`${prop.bgColor} p-3 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3`}>
                    <IconComponent className={`h-8 w-8 ${prop.color} group-hover:scale-125 transition-all duration-500 animate-pulse group-hover:animate-bounce-gentle`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors duration-300">
                        {prop.title}
                      </h4>
                      <Badge className="text-xs bg-primary text-primary-foreground group-hover:bg-primary/90 transition-all duration-300 font-medium">
                        {prop.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {prop.description}
                    </p>
                  </div>
                  
                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductValueProposition;