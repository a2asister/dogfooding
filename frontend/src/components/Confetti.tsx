import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speedX: number;
  speedY: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7', '#22c55e', '#f59e0b'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: 50 + Math.random() * 100,
        y: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 8,
        speedY: 2 + Math.random() * 4,
      });
    }
    
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.speedX,
          y: p.y + p.speedY,
          rotation: p.rotation + 15,
          speedY: p.speedY + 0.3,
        })).filter((p) => p.y < 200)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}
