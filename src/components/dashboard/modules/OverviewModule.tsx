import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, Target, CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export const OverviewModule = () => {
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasCompletedOnboarding = profile?.onboarding_completed;

  return (
    <div className="relative space-y-6">
      {/* Floating Welcome Card for Completed Onboarding */}
      {hasCompletedOnboarding && (
        <div className="relative z-10 mx-auto max-w-2xl -mb-4">
          <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200/20 via-teal-200/20 to-violet-200/20 animate-pulse" />
            <CardContent className="relative p-8 text-center">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                ✨ Welcome to Your Career Command Center! ✨
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                You've completed onboarding—amazing work 🎉!<br />
                Your entire professional journey now lives right here, beautifully organized and ready to impress.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span>💼</span>
                  <span>Showcase experience & skills</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>📄</span>
                  <span>Preview & update resume</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🤖</span>
                  <span>AI insights for interviews</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                This isn't just a profile—it's your story, ready to shine. Keep it fresh and let AI help you reach your dream role! 🌟
              </p>
              <Button 
                className="bg-gradient-to-r from-violet-500 to-teal-500 hover:from-violet-600 hover:to-teal-600 text-white border-0 shadow-lg"
                onClick={() => navigate("/dashboard/resume-builder")}
              >
                Let's Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            {hasCompletedOnboarding 
              ? "Here's your interview preparation dashboard"
              : "Complete your profile setup to get the most out of Interview4U"
            }
          </p>
        </div>
      </div>

      {!hasCompletedOnboarding && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <User className="h-5 w-5" />
              Continue Your Profile Setup
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              You have some saved progress. Complete your profile to unlock personalized interview experiences and better feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <div className="flex items-center justify-between mb-1">
                  <span>Profile Progress</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full w-[30%]"></div>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/onboarding")}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Resume Your Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Status
            </CardTitle>
            {hasCompletedOnboarding ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasCompletedOnboarding ? "Complete" : "In Progress"}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasCompletedOnboarding 
                ? "Your profile is fully set up"
                : "Continue setup for better experience"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quick Actions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate("/dashboard/interview")}
              >
                Start Interview
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate("/dashboard/resume-builder")}
              >
                Build Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Resources
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-muted-foreground">
              Interview tips and resources
            </p>
          </CardContent>
        </Card>
      </div>

      {hasCompletedOnboarding && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interview sessions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity to show.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Personalized suggestions for your interview prep</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start with a practice interview to get personalized recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};