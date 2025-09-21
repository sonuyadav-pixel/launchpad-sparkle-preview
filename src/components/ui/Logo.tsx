import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import companyLogo from "@/assets/interview4u-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

export const Logo = ({ className, size = "md", clickable = true }: LogoProps) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto"
  };

  const handleClick = () => {
    if (clickable) {
      navigate("/");
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={!clickable}
      className={cn(
        "flex items-center transition-opacity",
        clickable && "hover:opacity-80 cursor-pointer",
        !clickable && "cursor-default",
        className
      )}
    >
      <img 
        src={companyLogo} 
        alt="Interview4U" 
        className={cn(sizeClasses[size])}
      />
    </button>
  );
};