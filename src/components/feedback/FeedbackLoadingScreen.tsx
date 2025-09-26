import { Brain, BarChart3, FileText, Lightbulb, Loader2 } from "lucide-react";

interface FeedbackLoadingScreenProps {
  variant?: 'full' | 'sidebar';
}

export function FeedbackLoadingScreen({ variant = 'full' }: FeedbackLoadingScreenProps) {
  const loadingSteps = [
    { icon: FileText, text: "Analyzing transcript...", delay: 0 },
    { icon: Brain, text: "Processing with AI...", delay: 1000 },
    { icon: BarChart3, text: "Calculating scores...", delay: 2000 },
    { icon: Lightbulb, text: "Generating insights...", delay: 3000 },
  ];

  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-lg font-semibold">Feedback Loading</h3>
            <div className="relative">
              <Brain className="w-12 h-12 text-primary animate-pulse" />
              <Loader2 className="w-4 h-4 absolute -top-1 -right-1 animate-spin text-primary" />
            </div>
          </div>
          
          <div className="space-y-3 max-w-xs">
            {loadingSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <step.icon className="w-4 h-4 text-muted-foreground animate-pulse" />
                <span className="text-muted-foreground">{step.text}</span>
              </div>
            ))}
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-md">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Feedback Loading</h1>
          <p className="text-muted-foreground">
            Our AI is analyzing your interview performance and generating detailed feedback
          </p>
        </div>

        {/* Main Loading Animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto"></div>
          <Brain className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-muted/50">
              <step.icon className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">{step.text}</span>
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Analyzing...</span>
            <span>Almost done</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This may take a few moments. Please don't close this page.
        </p>
      </div>
    </div>
  );
}