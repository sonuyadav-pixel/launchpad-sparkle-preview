import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Video, BarChart3, Crown } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video Interview Analysis",
    description: "Get detailed feedback on your body language, eye contact, and presentation skills."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track your improvement over time with detailed performance metrics and insights."
  },
  {
    icon: TrendingUp,
    title: "Personalized Coaching",
    description: "Receive tailored recommendations based on your specific industry and role."
  },
  {
    icon: Crown,
    title: "Priority Support",
    description: "Get premium support and access to exclusive career coaching resources."
  }
];

export const InterviewPlusModule = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-white">
            Pro
          </Badge>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview+</h1>
          <p className="text-muted-foreground mt-1">
            Premium AI interview coaching and insights to accelerate your career growth.
          </p>
        </div>
      </div>

      {/* Premium CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Unlock Premium Features</CardTitle>
          <CardDescription className="text-lg">
            Take your interview skills to the next level with advanced AI coaching.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">$29/month</div>
          <Button 
            size="lg" 
            className="btn-hover-scale bg-gradient-to-r from-primary to-accent px-8 py-3 text-lg font-semibold"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to Pro
          </Button>
          <p className="text-sm text-muted-foreground">7-day free trial • Cancel anytime</p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="card-hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>What's included in Interview+</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 text-muted-foreground">Free Plan</h4>
              <ul className="space-y-2 text-sm">
                <li>• Basic interview practice</li>
                <li>• Text-based feedback</li>
                <li>• Limited sessions per month</li>
                <li>• Standard question bank</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">Interview+ Pro</h4>
              <ul className="space-y-2 text-sm">
                <li>• Unlimited interview sessions</li>
                <li>• Video analysis & feedback</li>
                <li>• Advanced performance analytics</li>
                <li>• Industry-specific questions</li>
                <li>• Personalized coaching tips</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};