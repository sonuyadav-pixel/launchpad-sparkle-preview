import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Video, BarChart3, Crown, Brain, Lock, Target, Star } from "lucide-react";

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

export const InterviewPlusModule = ({ feedback, suggestions }: { feedback?: any, suggestions?: any[] }) => {
  const freeSuggestions = suggestions?.filter(s => !s.is_premium) || [];
  const premiumSuggestions = suggestions?.filter(s => s.is_premium) || [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

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

      {/* Performance Analysis Section */}
      {feedback && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Performance Analysis</h3>
          
          {/* Performance Insights */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg hover:scale-105 transition-transform group cursor-pointer">
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                    {Math.round((feedback.communication_score + feedback.clarity_score) / 2 * 10)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-2">Communication Score</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg hover:scale-105 transition-transform group cursor-pointer">
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                    {Math.round(feedback.confidence_score * 10)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-2">Confidence Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-4">
            {/* What Went Well */}
            <Card className="relative bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:opacity-0 transition-opacity duration-300">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                  <TrendingUp className="h-4 w-4" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feedback.strengths?.slice(0, 2).map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-green-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="relative bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:opacity-0 transition-opacity duration-300">
                <Lock className="h-6 w-6 text-orange-600" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                  <Target className="h-4 w-4" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feedback.weaknesses?.slice(0, 2).map((weakness: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-orange-700">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
            className="btn-hover-scale bg-gradient-to-r from-primary to-accent px-6 py-2 text-base font-semibold"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Unlock Interview Plus
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