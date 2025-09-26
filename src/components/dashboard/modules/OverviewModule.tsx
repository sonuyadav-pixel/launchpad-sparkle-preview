import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, Target, CheckCircle } from "lucide-react";

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
    <div className="space-y-6">
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
              Complete Your Profile Setup
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              You skipped the onboarding process. Complete your profile to unlock personalized interview experiences and better feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/onboarding")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Complete Setup Now
            </Button>
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
              {hasCompletedOnboarding ? "Complete" : "Incomplete"}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasCompletedOnboarding 
                ? "Your profile is fully set up"
                : "Complete your profile for better experience"
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