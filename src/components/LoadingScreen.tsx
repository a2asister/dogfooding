import { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = '加载中...' }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    const sunRadius = 30;
    
    let rotation = 0;
    let pulsePhase = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      rotation += 0.02;
      pulsePhase += 0.05;
      
      const pulse = Math.sin(pulsePhase) * 0.2 + 0.8;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayLength = radius * (0.6 + Math.sin(pulsePhase + i * 0.5) * 0.4);
        
        const gradient = ctx.createLinearGradient(
          Math.cos(angle) * sunRadius,
          Math.sin(angle) * sunRadius,
          Math.cos(angle) * rayLength,
          Math.sin(angle) * rayLength
        );
        gradient.addColorStop(0, `rgba(255, 180, 50, ${0.8 * pulse})`);
        gradient.addColorStop(1, `rgba(255, 180, 50, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - 0.1) * sunRadius, Math.sin(angle - 0.1) * sunRadius);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.lineTo(Math.cos(angle + 0.1) * sunRadius, Math.sin(angle + 0.1) * sunRadius);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      ctx.restore();
      
      const sunGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, sunRadius
      );
      sunGradient.addColorStop(0, `rgba(255, 255, 200, ${pulse})`);
      sunGradient.addColorStop(0.5, `rgba(255, 200, 50, ${pulse})`);
      sunGradient.addColorStop(1, `rgba(255, 150, 0, ${pulse * 0.8})`);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();
      
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, sunRadius,
        centerX, centerY, radius * 1.5
      );
      glowGradient.addColorStop(0, `rgba(255, 180, 50, ${0.3 * pulse})`);
      glowGradient.addColorStop(1, 'rgba(255, 180, 50, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <canvas ref={canvasRef} className="loading-animation" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
