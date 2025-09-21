import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Play, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const InterviewModule = () => {
  const navigate = useNavigate();
  
  const handleStartInterview = () => {
    navigate('/interview');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview</h1>
          <p className="text-muted-foreground mt-1">
            Start your AI-powered interview to receive instant feedback and improve your performance.
          </p>
        </div>
      </div>

      {/* Main CTA Card */}
      <Card className="card-hover-lift">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Ready to Practice?</CardTitle>
          <CardDescription className="text-lg">
            Get personalized feedback and improve your interview skills with our AI coach.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            size="lg" 
            className="btn-hover-scale bg-gradient-to-r from-primary to-accent px-8 py-3 text-lg font-semibold"
            onClick={handleStartInterview}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Interview
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Real-time Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get instant analysis of your responses and personalized improvement suggestions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Smart Questions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI-generated questions tailored to your role and experience level.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Flexible Practice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Practice anytime, anywhere with sessions that fit your schedule.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};