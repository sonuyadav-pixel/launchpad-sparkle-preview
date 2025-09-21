import React, { useState } from 'react';

interface AIGraphElementProps {
  type: 'neural-network' | 'data-chart' | 'ai-brain' | 'performance-graph' | 'skill-radar' | 'analysis-flow';
  position: { x: string; y: string };
  delay?: number;
  title?: string;
  description?: string;
}

const AIGraphElement = ({ type, position, delay = 0, title, description }: AIGraphElementProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setShowInfo(true);
    setTimeout(() => {
      setIsClicked(false);
      setShowInfo(false);
    }, 4000);
  };

  const renderAIGraph = () => {
    switch (type) {
      case 'neural-network':
        return (
          <div className={`relative w-20 h-16 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="80" height="64" className="animate-pulse">
              {/* Nodes */}
              <circle cx="10" cy="12" r="3" fill="#2196F3" className="animate-bounce" />
              <circle cx="10" cy="32" r="3" fill="#2196F3" />
              <circle cx="10" cy="52" r="3" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
              
              <circle cx="40" cy="8" r="3" fill="#ffffff" className="animate-pulse" />
              <circle cx="40" cy="24" r="3" fill="#ffffff" />
              <circle cx="40" cy="40" r="3" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
              <circle cx="40" cy="56" r="3" fill="#ffffff" />
              
              <circle cx="70" cy="20" r="3" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.7s' }} />
              <circle cx="70" cy="44" r="3" fill="#2196F3" />
              
              {/* Connections */}
              <line x1="13" y1="12" x2="37" y2="8" stroke="#2196F3" strokeWidth="1" opacity="0.6" className="animate-pulse" />
              <line x1="13" y1="12" x2="37" y2="24" stroke="#2196F3" strokeWidth="1" opacity="0.6" />
              <line x1="13" y1="32" x2="37" y2="40" stroke="#2196F3" strokeWidth="1" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
              <line x1="43" y1="24" x2="67" y2="20" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
              <line x1="43" y1="40" x2="67" y2="44" stroke="#ffffff" strokeWidth="1" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
            </svg>
          </div>
        );

      case 'data-chart':
        return (
          <div className={`relative w-18 h-14 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="72" height="56" className="animate-fade-in">
              {/* Bars */}
              <rect x="8" y="40" width="8" height="12" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.1s' }} />
              <rect x="20" y="28" width="8" height="24" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
              <rect x="32" y="16" width="8" height="36" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
              <rect x="44" y="24" width="8" height="28" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
              <rect x="56" y="8" width="8" height="44" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
              
              {/* Trend line */}
              <polyline points="12,44 24,32 36,20 48,28 60,12" stroke="#ffffff" strokeWidth="2" fill="none" className="animate-pulse" />
            </svg>
          </div>
        );

      case 'ai-brain':
        return (
          <div className={`relative w-16 h-16 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="64" height="64" className="animate-pulse">
              {/* Brain outline */}
              <path d="M32 8 C24 8, 16 16, 16 24 C16 32, 20 40, 28 44 C20 48, 16 56, 24 56 C32 56, 40 56, 48 56 C56 56, 52 48, 44 44 C52 40, 56 32, 56 24 C56 16, 48 8, 40 8 C36 8, 34 8, 32 8 Z" 
                    stroke="#2196F3" strokeWidth="2" fill="none" className="animate-pulse" />
              
              {/* Neural pathways */}
              <circle cx="24" cy="24" r="2" fill="#ffffff" className="animate-bounce" />
              <circle cx="40" cy="28" r="2" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
              <circle cx="32" cy="36" r="2" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
              <circle cx="28" cy="44" r="2" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.9s' }} />
              
              {/* Connections */}
              <line x1="24" y1="24" x2="40" y2="28" stroke="#2196F3" strokeWidth="1" opacity="0.6" className="animate-pulse" />
              <line x1="40" y1="28" x2="32" y2="36" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
            </svg>
          </div>
        );

      case 'performance-graph':
        return (
          <div className={`relative w-20 h-16 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="80" height="64" className="animate-fade-in">
              {/* Grid */}
              <defs>
                <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="80" height="64" fill="url(#grid)" />
              
              {/* Performance curve */}
              <path d="M8,56 Q24,40 40,32 T72,16" stroke="#2196F3" strokeWidth="3" fill="none" className="animate-pulse" />
              
              {/* Data points */}
              <circle cx="16" cy="48" r="2" fill="#ffffff" className="animate-bounce" />
              <circle cx="32" cy="36" r="2" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
              <circle cx="48" cy="28" r="2" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
              <circle cx="64" cy="20" r="2" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
            </svg>
          </div>
        );

      case 'skill-radar':
        return (
          <div className={`relative w-16 h-16 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="64" height="64" className="animate-pulse">
              {/* Radar circles */}
              <circle cx="32" cy="32" r="28" stroke="#2196F3" strokeWidth="1" fill="none" opacity="0.3" />
              <circle cx="32" cy="32" r="20" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.4" />
              <circle cx="32" cy="32" r="12" stroke="#2196F3" strokeWidth="1" fill="none" opacity="0.5" />
              
              {/* Radar lines */}
              <line x1="32" y1="4" x2="32" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="4" y1="32" x2="60" y2="32" stroke="#2196F3" strokeWidth="1" opacity="0.3" />
              
              {/* Skill points */}
              <polygon points="32,12 48,24 44,44 20,44 16,24" fill="#2196F3" opacity="0.6" className="animate-pulse" />
              
              {/* Labels */}
              <circle cx="32" cy="12" r="2" fill="#ffffff" className="animate-bounce" />
              <circle cx="48" cy="24" r="2" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
              <circle cx="44" cy="44" r="2" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
            </svg>
          </div>
        );

      case 'analysis-flow':
        return (
          <div className={`relative w-20 h-14 transition-all duration-500 ${isClicked ? 'scale-125' : 'scale-100'}`}>
            <svg width="80" height="56" className="animate-fade-in">
              {/* Flow boxes */}
              <rect x="4" y="20" width="16" height="16" rx="2" fill="#2196F3" className="animate-pulse" />
              <rect x="32" y="20" width="16" height="16" rx="2" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
              <rect x="60" y="20" width="16" height="16" rx="2" fill="#2196F3" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
              
              {/* Arrows */}
              <polygon points="24,28 28,24 28,26 30,26 30,30 28,30 28,32" fill="#ffffff" className="animate-bounce" />
              <polygon points="52,28 56,24 56,26 58,26 58,30 56,30 56,32" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
              
              {/* Data streams */}
              <circle cx="12" cy="12" r="1" fill="#ffffff" className="animate-bounce" />
              <circle cx="40" cy="12" r="1" fill="#2196F3" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
              <circle cx="68" cy="12" r="1" fill="#ffffff" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute cursor-pointer group z-10"
      style={{ 
        left: position.x, 
        top: position.y,
        animationDelay: `${delay}s`
      }}
      onClick={handleClick}
    >
      {/* AI Graph Element */}
      <div className="relative animate-float">
        {renderAIGraph()}
        
        {/* Interactive glow effect */}
        <div className="absolute inset-0 bg-primary/30 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110"></div>
      </div>
      
      {/* Information popup */}
      {showInfo && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-2xl animate-scale-in z-30 min-w-52">
          <h4 className="font-bold text-primary mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-background/95 border-l border-t rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const AIGraphBackground = () => {
  const aiElements = [
    {
      type: 'neural-network' as const,
      position: { x: '12%', y: '15%' },
      title: 'Neural Network',
      description: 'Deep learning algorithms analyze candidate responses and behavior patterns',
      delay: 0
    },
    {
      type: 'data-chart' as const,
      position: { x: '82%', y: '25%' },
      title: 'Performance Analytics',
      description: 'Real-time performance metrics and hiring success rates',
      delay: 0.5
    },
    {
      type: 'ai-brain' as const,
      position: { x: '15%', y: '65%' },
      title: 'AI Intelligence',
      description: 'Advanced AI processes natural language and evaluates candidate skills',
      delay: 1
    },
    {
      type: 'performance-graph' as const,
      position: { x: '75%', y: '70%' },
      title: 'Growth Tracking',
      description: 'Track improvement trends and candidate development over time',
      delay: 1.5
    },
    {
      type: 'skill-radar' as const,
      position: { x: '45%', y: '12%' },
      title: 'Skill Assessment',
      description: 'Multi-dimensional skill evaluation across technical and soft skills',
      delay: 2
    },
    {
      type: 'analysis-flow' as const,
      position: { x: '65%', y: '45%' },
      title: 'Data Processing',
      description: 'Streamlined data flow from interview to actionable insights',
      delay: 2.5
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce-gentle"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-accent/20 rounded-full blur-lg animate-pulse"></div>
      
      {/* AI Graph Elements */}
      {aiElements.map((element, index) => (
        <AIGraphElement key={index} {...element} />
      ))}
      
      {/* Data particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float"
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

export default AIGraphBackground;