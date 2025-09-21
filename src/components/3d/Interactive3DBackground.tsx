import React, { useState } from 'react';

interface Interactive3DElementProps {
  type: 'brain' | 'cube' | 'sphere' | 'pyramid';
  position: { x: string; y: string };
  delay?: number;
  text?: string;
  description?: string;
}

const Interactive3DElement = ({ type, position, delay = 0, text, description }: Interactive3DElementProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showText, setShowText] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setShowText(true);
    setTimeout(() => {
      setIsClicked(false);
      setShowText(false);
    }, 3000);
  };

  const get3DShape = () => {
    switch (type) {
      case 'brain':
        return (
          <div className={`relative w-16 h-16 transition-all duration-500 ${isClicked ? 'scale-150' : 'scale-100'}`}>
            <div className="absolute inset-0 bg-primary rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute inset-2 bg-primary/50 rounded-full animate-bounce"></div>
            <div className="absolute inset-4 bg-white/30 rounded-full"></div>
          </div>
        );
      case 'cube':
        return (
          <div className={`relative w-12 h-12 transition-all duration-500 transform-gpu ${isClicked ? 'scale-150 rotate-45' : 'scale-100'}`}>
            <div 
              className="w-12 h-12 bg-gradient-to-br from-primary to-accent transform-gpu"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(45deg) rotateY(45deg)',
                boxShadow: '0 0 20px rgba(33, 150, 243, 0.5)'
              }}
            ></div>
          </div>
        );
      case 'sphere':
        return (
          <div className={`relative w-14 h-14 transition-all duration-500 ${isClicked ? 'scale-150' : 'scale-100'}`}>
            <div 
              className="w-14 h-14 bg-gradient-to-br from-white to-primary rounded-full transform-gpu"
              style={{
                boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)'
              }}
            ></div>
          </div>
        );
      case 'pyramid':
        return (
          <div className={`relative w-12 h-12 transition-all duration-500 ${isClicked ? 'scale-150 rotate-180' : 'scale-100'}`}>
            <div 
              className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-primary transform-gpu"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(33, 150, 243, 0.7))',
                transform: 'rotateX(30deg) rotateY(30deg)'
              }}
            ></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute cursor-pointer group"
      style={{ 
        left: position.x, 
        top: position.y,
        animationDelay: `${delay}s`
      }}
      onClick={handleClick}
    >
      {/* 3D Element */}
      <div className="relative animate-float">
        {get3DShape()}
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150"></div>
      </div>
      
      {/* Text popup */}
      {showText && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 border shadow-2xl animate-scale-in z-20 min-w-48">
          <h4 className="font-bold text-primary mb-2">{text}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-background/90 border-l border-t rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const Interactive3DBackground = () => {
  const elements = [
    {
      type: 'brain' as const,
      position: { x: '10%', y: '20%' },
      text: 'AI Brain',
      description: 'Advanced artificial intelligence processes candidate responses in real-time',
      delay: 0
    },
    {
      type: 'cube' as const,
      position: { x: '85%', y: '30%' },
      text: 'Data Processing',
      description: 'Secure data processing and analysis of interview content',
      delay: 0.5
    },
    {
      type: 'sphere' as const,
      position: { x: '15%', y: '70%' },
      text: 'Global Network',
      description: 'Connected worldwide network of HR professionals and candidates',
      delay: 1
    },
    {
      type: 'pyramid' as const,
      position: { x: '80%', y: '75%' },
      text: 'Success Metrics',
      description: 'Track hiring success rates and candidate satisfaction scores',
      delay: 1.5
    },
    {
      type: 'brain' as const,
      position: { x: '50%', y: '15%' },
      text: 'Neural Network',
      description: 'Deep learning algorithms for better candidate assessment',
      delay: 2
    },
    {
      type: 'sphere' as const,
      position: { x: '70%', y: '50%' },
      text: 'Innovation Hub',
      description: 'Continuous improvement and feature development',
      delay: 2.5
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/20 rounded-full blur-xl animate-bounce-gentle"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-accent/30 rounded-full blur-lg animate-pulse"></div>
      
      {/* Interactive 3D Elements */}
      {elements.map((element, index) => (
        <div key={index} className="pointer-events-auto">
          <Interactive3DElement {...element} />
        </div>
      ))}
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Interactive3DBackground;