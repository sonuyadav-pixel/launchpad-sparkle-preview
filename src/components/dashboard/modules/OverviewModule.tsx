import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export const OverviewModule = () => {
  const { profile, loading } = useUserProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding modal for new users who haven't completed onboarding
    if (!loading && profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [loading, profile]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

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

  return (
    <>
      <div className="space-y-6">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Interview4U Dashboard
          </h1>
          <p className="text-muted-foreground mb-8">
            Your AI-powered interview preparation platform
          </p>
          
          {profile?.onboarding_completed ? (
            <div className="text-lg text-primary">
              🎉 Profile Complete! Ready to start practicing interviews.
            </div>
          ) : (
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Complete Your Profile Setup
            </button>
          )}
        </div>
      </div>

      <OnboardingModal 
        open={showOnboarding} 
        onClose={handleCloseOnboarding} 
      />
    </>
  );
};