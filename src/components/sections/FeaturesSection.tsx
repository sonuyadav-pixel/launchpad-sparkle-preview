import { Brain, Target, BarChart, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Adaptive AI Questions",
    description: "Smart interview questions that adapt in real-time based on candidate responses and role requirements."
  },
  {
    icon: Target,
    title: "Candidate Scoring & Insights",
    description: "Automatically score candidates on skills, communication, and problem-solving abilities with detailed insights."
  },
  {
    icon: BarChart,
    title: "HR Dashboard",
    description: "View comprehensive feedback, filter candidates by skills, and export detailed reports for decision-making."
  },
  {
    icon: Zap,
    title: "Seamless Integrations",
    description: "Connect with your existing ATS, Slack notifications, and email systems for streamlined workflow."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-section-light overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Features You'll Love
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-sm animate-scale-in relative overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce-gentle">
                  <feature.icon className="w-8 h-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base leading-relaxed group-hover:text-card-foreground transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;