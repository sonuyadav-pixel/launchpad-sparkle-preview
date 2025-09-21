import React, { useState } from 'react';

interface Floating3DShapeProps {
  type: 'cube' | 'pyramid' | 'sphere' | 'ring' | 'crystal';
  position: { x: string; y: string };
  delay?: number;
  scale?: number;
}

const Floating3DShape = ({ type, position, delay = 0, scale = 1 }: Floating3DShapeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderShape = () => {
    const baseScale = isHovered ? scale * 1.2 : scale;
    
    switch (type) {
      case 'cube':
        return (
          <div 
            className={`relative transition-all duration-500 transform-gpu`}
            style={{ 
              width: `${24 * baseScale}px`, 
              height: `${24 * baseScale}px`,
              transform: `rotateX(45deg) rotateY(45deg) scale(${baseScale})`
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-primary/80 to-accent/60 transform-gpu shadow-lg"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 0 20px rgba(33, 150, 243, 0.4)'
              }}
            ></div>
          </div>
        );
      
      case 'pyramid':
        return (
          <div className={`relative transition-all duration-500`} style={{ transform: `scale(${baseScale})` }}>
            <div 
              className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-primary/70 transform-gpu"
              style={{
                filter: 'drop-shadow(0 0 15px rgba(33, 150, 243, 0.6))',
                transform: 'rotateX(20deg) rotateY(20deg)'
              }}
            ></div>
          </div>
        );
      
      case 'sphere':
        return (
          <div className={`relative transition-all duration-500`} style={{ transform: `scale(${baseScale})` }}>
            <div 
              className="w-6 h-6 bg-gradient-to-br from-white/80 to-primary/60 rounded-full transform-gpu"
              style={{
                boxShadow: 'inset -2px -2px 8px rgba(0,0,0,0.3), 0 0 15px rgba(255,255,255,0.4)'
              }}
            ></div>
          </div>
        );
      
      case 'ring':
        return (
          <div className={`relative transition-all duration-500`} style={{ transform: `scale(${baseScale})` }}>
            <div 
              className="w-8 h-8 border-2 border-primary/70 rounded-full transform-gpu"
              style={{
                boxShadow: '0 0 12px rgba(33, 150, 243, 0.5)',
                background: 'radial-gradient(circle, transparent 40%, rgba(33, 150, 243, 0.2) 60%)'
              }}
            ></div>
          </div>
        );
      
      case 'crystal':
        return (
          <div className={`relative transition-all duration-500`} style={{ transform: `scale(${baseScale})` }}>
            <div 
              className="transform-gpu"
              style={{
                width: '16px',
                height: '20px',
                background: 'linear-gradient(45deg, #2196F3, #ffffff, #2196F3)',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                filter: 'drop-shadow(0 0 10px rgba(33, 150, 243, 0.5))'
              }}
            ></div>
          </div>
        );
    }
  };

  return (
    <div 
      className="absolute cursor-pointer animate-float"
      style={{ 
        left: position.x, 
        top: position.y,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random()}s`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderShape()}
    </div>
  );
};

interface Section3DDecorProps {
  sectionType: 'timeline' | 'features' | 'testimonials' | 'cta';
}

const Section3DDecor = ({ sectionType }: Section3DDecorProps) => {
  const getShapes = () => {
    switch (sectionType) {
      case 'timeline':
        return [
          { type: 'cube' as const, position: { x: '8%', y: '20%' }, delay: 0, scale: 0.8 },
          { type: 'crystal' as const, position: { x: '88%', y: '15%' }, delay: 0.5, scale: 1.2 },
          { type: 'ring' as const, position: { x: '12%', y: '70%' }, delay: 1, scale: 1 },
          { type: 'pyramid' as const, position: { x: '85%', y: '75%' }, delay: 1.5, scale: 0.9 },
          { type: 'sphere' as const, position: { x: '45%', y: '10%' }, delay: 2, scale: 1.1 }
        ];
      case 'features':
        return [
          { type: 'pyramid' as const, position: { x: '5%', y: '25%' }, delay: 0, scale: 1 },
          { type: 'sphere' as const, position: { x: '92%', y: '30%' }, delay: 0.3, scale: 0.8 },
          { type: 'crystal' as const, position: { x: '10%', y: '80%' }, delay: 0.6, scale: 1.3 },
          { type: 'ring' as const, position: { x: '88%', y: '85%' }, delay: 0.9, scale: 1 }
        ];
      case 'testimonials':
        return [
          { type: 'ring' as const, position: { x: '6%', y: '30%' }, delay: 0, scale: 1.2 },
          { type: 'cube' as const, position: { x: '90%', y: '25%' }, delay: 0.4, scale: 0.9 },
          { type: 'sphere' as const, position: { x: '8%', y: '75%' }, delay: 0.8, scale: 1 },
          { type: 'crystal' as const, position: { x: '85%', y: '80%' }, delay: 1.2, scale: 1.1 }
        ];
      case 'cta':
        return [
          { type: 'crystal' as const, position: { x: '10%', y: '20%' }, delay: 0, scale: 1.4 },
          { type: 'ring' as const, position: { x: '85%', y: '25%' }, delay: 0.3, scale: 1.2 },
          { type: 'pyramid' as const, position: { x: '12%', y: '75%' }, delay: 0.6, scale: 1 },
          { type: 'sphere' as const, position: { x: '88%', y: '80%' }, delay: 0.9, scale: 1.3 }
        ];
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {getShapes().map((shape, index) => (
        <div key={index} className="pointer-events-auto">
          <Floating3DShape {...shape} />
        </div>
      ))}
      
      {/* Additional floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/50 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        ></div>
      ))}
    </div>
  );
};

export default Section3DDecor;