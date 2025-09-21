import React, { useState, useEffect } from 'react';
import aiInterview1 from "@/assets/ai-interview-1.jpg";
import aiInterview2 from "@/assets/ai-interview-2.jpg";
import aiInterview3 from "@/assets/ai-interview-3.jpg";
import aiInterview4 from "@/assets/ai-interview-4.jpg";

const AutoScrollingBackground = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const interviewImages = [
    aiInterview1,
    aiInterview2,
    aiInterview3,
    aiInterview4
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % interviewImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [interviewImages.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Auto-scrolling image backgrounds */}
      {interviewImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-40' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundAttachment: 'fixed'
          }}
        />
      ))}
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>
      
      {/* Additional blue tint to match brand */}
      <div className="absolute inset-0 bg-primary/20"></div>
      
      {/* Subtle animation overlay */}
      <div className="absolute inset-0">
        {/* Moving light effects */}
        <div className="absolute top-1/4 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-bounce-gentle"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      {/* Progress indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {interviewImages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoScrollingBackground;