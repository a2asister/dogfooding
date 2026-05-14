import { useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { Particle } from '~/types';

export function useParticleSystem(
  canvasRef: { value: HTMLCanvasElement | null },
  particleCount: number = 50
) {
  const particles = useSignal<Particle[]>([]);
  const animationId = useSignal<number>(0);

  const initParticles = (width: number, height: number) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
    
    particles.value = newParticles;
  };

  const updateParticles = (gravityX: number, gravityY: number, width: number, height: number) => {
    particles.value = particles.value.map((p) => {
      const newP = { ...p };
      newP.vx += gravityX * 0.1;
      newP.vy += gravityY * 0.1;
      newP.x += newP.vx;
      newP.y += newP.vy;

      if (newP.x < 0 || newP.x > width) newP.vx *= -1;
      if (newP.y < 0 || newP.y > height) newP.vy *= -1;

      newP.vx *= 0.99;
      newP.vy *= 0.99;

      return newP;
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.value.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  };

  useVisibleTask$(({ cleanup }) => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initParticles(canvas.width, canvas.height);

    cleanup(() => {
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
      }
    });
  });

  return { particles, updateParticles, drawParticles, initParticles };
}