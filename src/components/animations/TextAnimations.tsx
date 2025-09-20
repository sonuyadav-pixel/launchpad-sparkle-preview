import React, { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedHeading = ({ children, className = "", delay = 0 }: AnimatedHeadingProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95'
      } ${className}`}
      style={{
        textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );
};

interface RotatingTextProps {
  texts: string[];
  className?: string;
  interval?: number;
}

const RotatingText = ({ texts, className = "", interval = 3000 }: RotatingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsAnimating(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`relative ${className}`}>
      <span 
        className={`inline-block transition-all duration-300 ${
          isAnimating 
            ? 'opacity-0 transform translate-y-2 scale-95' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}
      >
        {texts[currentIndex]}
      </span>
    </div>
  );
};

interface MultiLineAnimatedTextProps {
  lines: string[];
  className?: string;
  lineDelay?: number;
}

const MultiLineAnimatedText = ({ lines, className = "", lineDelay = 200 }: MultiLineAnimatedTextProps) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    lines.forEach((_, index) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, index * lineDelay);
    });
  }, [lines, lineDelay]);

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <div
          key={index}
          className={`transform transition-all duration-700 ${
            visibleLines.includes(index)
              ? 'translate-x-0 opacity-100'
              : 'translate-x-4 opacity-0'
          }`}
          style={{ transitionDelay: `${index * 0.1}s` }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export { AnimatedHeading, RotatingText, MultiLineAnimatedText };