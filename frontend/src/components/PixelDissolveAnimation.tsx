import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Color } from '../types';

interface PixelDissolveAnimationProps {
  colors: Color[];
  imageUrl?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  delay: number;
}

const PixelDissolveAnimation = ({ colors }: PixelDissolveAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: 300 });
    }
  }, []);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const particlesPerColor = 40;

    colors.forEach((color, colorIndex) => {
      const targetX = dimensions.width / colors.length * colorIndex + dimensions.width / (colors.length * 2);
      const targetY = 150;

      for (let i = 0; i < particlesPerColor; i++) {
        newParticles.push({
          id: colorIndex * particlesPerColor + i,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          targetX: targetX + (Math.random() - 0.5) * 60,
          targetY: targetY + (Math.random() - 0.5) * 40,
          color: color.hex,
          size: 4 + Math.random() * 8,
          delay: colorIndex * 0.1 + Math.random() * 0.3,
        });
      }
    });

    setParticles(newParticles);
    setShowParticles(true);

    const timer = setTimeout(() => setShowParticles(false), 2500);
    return () => clearTimeout(timer);
  }, [colors, dimensions]);

  return (
    <div
      ref={containerRef}
      className="pixel-animation-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        marginBottom: '20px',
        overflow: 'hidden',
        borderRadius: '15px',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <AnimatePresence>
        {showParticles && particles.map((particle) => (
          <motion.div
          key={particle.id}
          className="particle"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: particle.targetX,
            y: particle.targetY,
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </AnimatePresence>

    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '48px',
        opacity: 0.1,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      ✨
    </motion.div>
  </div>
);
};

export default PixelDissolveAnimation;
