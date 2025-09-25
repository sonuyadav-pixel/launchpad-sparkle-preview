import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
}

export const Loader = ({ 
  size = "md", 
  className, 
  text, 
  variant = "spinner" 
}: LoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn(
            "text-muted-foreground animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-full animate-bounce",
                size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s"
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn(
            "text-muted-foreground animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className={cn(
          "bg-primary rounded-full animate-ping",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn(
            "text-muted-foreground animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-sm animate-pulse",
                size === "sm" ? "w-1 h-4" : size === "md" ? "w-1 h-6" : size === "lg" ? "w-1.5 h-8" : "w-2 h-10"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1.2s"
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn(
            "text-muted-foreground animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
};

// Full screen loading overlay
export const LoadingOverlay = ({ 
  isLoading, 
  text = "Loading...",
  variant = "spinner",
  size = "lg"
}: { 
  isLoading: boolean; 
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card p-8 rounded-lg shadow-lg border animate-scale-in">
        <Loader variant={variant} size={size} text={text} />
      </div>
    </div>
  );
};

// Inline loading component for sections
export const SectionLoader = ({
  text = "Loading...",
  variant = "dots",
  size = "md",
  className
}: {
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <Loader variant={variant} size={size} text={text} />
    </div>
  );
};