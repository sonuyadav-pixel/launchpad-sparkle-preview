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
    <section className="py-20 bg-section-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Features You'll Love
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm"
            >
              <CardHeader>
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;