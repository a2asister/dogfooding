import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
}

export function Particles({ trigger, x, y }: { trigger: boolean; x: number; y: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: Date.now() + i,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
          angle: (Math.PI * 2 * i) / 20,
          distance: Math.random() * 100 + 50,
        });
      }
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, x, y]);

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          initial={{ scale: 1, opacity: 1, x: particle.x, y: particle.y }}
          animate={{
            scale: 0,
            opacity: 0,
            x: particle.x + Math.cos(particle.angle) * particle.distance,
            y: particle.y + Math.sin(particle.angle) * particle.distance,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </>
  );
}
