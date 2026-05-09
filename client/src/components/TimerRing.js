import React from 'react';
import { motion } from 'framer-motion';

const TimerRing = ({ progress, size, strokeWidth, color, secondaryColor, isDark, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth={strokeWidth}
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={false}
          animate={{
            strokeDashoffset: offset,
            stroke: color
          }}
          transition={{
            strokeDashoffset: { duration: 0.5, ease: 'easeInOut' },
            stroke: { duration: 0.3 }
          }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            filter: `drop-shadow(0 0 10px ${color}40)`
          }}
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={Math.max(0, offset - 10)}
          strokeLinecap="round"
          opacity={0.3}
          initial={false}
          animate={{
            strokeDashoffset: Math.max(0, offset - 10),
            stroke: secondaryColor
          }}
          transition={{
            strokeDashoffset: { duration: 0.5, ease: 'easeInOut' },
            stroke: { duration: 0.3 }
          }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default TimerRing;
