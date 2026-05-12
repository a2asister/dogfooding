import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Color, ColorRelationship } from '../types';

interface ConnectionLinesProps {
  colors: Color[];
  relationships: ColorRelationship[];
}

const ConnectionLines = ({ colors, relationships }: ConnectionLinesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, [colors.length]);

  const colorBlockWidth = 120;
  const gap = 15;
  const totalWidth = colors.length * colorBlockWidth + (colors.length - 1) * gap;
  const startX = (dimensions.width - totalWidth) / 2 + colorBlockWidth / 2;
  const centerY = dimensions.height / 2;

  const getColorPosition = (index: number) => ({
    x: startX + index * (colorBlockWidth + gap),
    y: centerY,
  });

  const createBezierPath = (
    x1: number, y1: number,
    x2: number, y2: number,
    type: string
  ) => {
    const midX = (x1 + x2) / 2;
    const curveHeight = type === 'complementary' ? 80 : 40;
    const controlY1 = y1 - curveHeight;
    return `M ${x1} ${y1} Q ${midX} ${controlY1} ${x2} ${y2}`;
  };

  return (
    <div ref={containerRef} className="connection-lines">
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="complementaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#4ecdc4" />
          </linearGradient>
          <linearGradient id="analogousGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#96ceb4" />
            <stop offset="100%" stopColor="#ffeaa7" />
          </linearGradient>
        </defs>

        {relationships.map((rel, index) => {
          const color1Index = colors.findIndex(c => c.hex === rel.color1);
          const color2Index = colors.findIndex(c => c.hex === rel.color2);

          if (color1Index === -1 || color2Index === -1) return null;

          const pos1 = getColorPosition(color1Index);
          const pos2 = getColorPosition(color2Index);
          const path = createBezierPath(pos1.x, pos1.y, pos2.x, pos2.y, rel.type);

          return (
            <motion.path
              key={index}
              className={`connection-line ${rel.type}`}
              d={path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{
                duration: 1.2,
                delay: index * 0.3 + 0.8,
                ease: 'easeInOut',
              }}
              style={{
                filter: `drop-shadow(0 0 ${8 * rel.strength}px ${rel.type === 'complementary' ? '#ff6b6b' : '#96ceb4'})`,
              }}
            />
          );
        })}

        {colors.map((color, index) => {
          const pos = getColorPosition(index);
          return (
            <motion.circle
              key={`dot-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill={color.hex}
              stroke="#fff"
              strokeWidth={2}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: index * 0.15 + 0.6,
                type: 'spring',
              }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ConnectionLines;
