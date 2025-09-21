import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, Trophy, Users, TrendingUp } from "lucide-react";

const ProductValueProposition = () => {
  const valueProps = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get detailed feedback on your responses, body language, and communication skills",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      badge: "Smart"
    },
    {
      icon: Target,
      title: "Personalized Questions",
      description: "Questions tailored to your industry, role, and experience level",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      badge: "Adaptive"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Real-time scoring and suggestions to improve your interview performance",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      badge: "Fast"
    },
    {
      icon: Trophy,
      title: "Performance Tracking",
      description: "Monitor your progress and see improvement over multiple sessions",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      badge: "Growth"
    },
    {
      icon: Users,
      title: "Industry Experts",
      description: "Questions and scenarios designed by hiring managers and industry professionals",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      badge: "Expert"
    },
    {
      icon: TrendingUp,
      title: "Success Analytics",
      description: "Detailed reports showing your strengths and areas for improvement",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      badge: "Insights"
    }
  ];

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Why Choose Our AI Interview Platform?</h3>
          <p className="text-muted-foreground">
            Transform your interview skills with cutting-edge AI technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valueProps.map((prop, index) => {
            const IconComponent = prop.icon;
            return (
              <div 
                key={index}
                className="group p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`${prop.bgColor} p-2 rounded-lg flex-shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${prop.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {prop.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {prop.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
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