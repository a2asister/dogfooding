import { component$, useVisibleTask$, useStore } from '@builder.io/qwik';
import type { FissionConfig, Particle } from '~/types/geometric';
import { createParticles, updateParticles, drawShape, drawGradientBackground } from '~/utils/animation';

interface FissionCanvasProps {
  config: FissionConfig;
  isPlaying: boolean;
  onReset$: () => void;
}

export const FissionCanvas = component$<FissionCanvasProps>(({ config, isPlaying, onReset$ }) => {
  const canvasRef = useStore<{ canvas: HTMLCanvasElement | null }>({ canvas: null });

  const state = useStore<{
    particles: Particle[];
    animationId: number | null;
  }>({
    particles: [],
    animationId: null,
  });

  const initializeParticles = () => {
    if (canvasRef.canvas) {
      const centerX = canvasRef.canvas.width / 2;
      const centerY = canvasRef.canvas.height / 2;
      state.particles = createParticles(config, centerX, centerY);
    }
  };

  const draw = () => {
    if (!canvasRef.canvas) return;

    const ctx = canvasRef.canvas.getContext('2d');
    if (!ctx) return;

    drawGradientBackground(ctx, canvasRef.canvas.width, canvasRef.canvas.height);

    state.particles.forEach((particle) => {
      if (config.trailEnabled && particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0]?.x ?? 0, particle.trail[0]?.y ?? 0);
        particle.trail.forEach((point, index) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = particle.color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      drawShape(
        ctx,
        particle.shapeType,
        particle.x,
        particle.y,
        particle.size,
        particle.rotation,
        particle.color,
        particle.opacity
      );
    });
  };

  const animate = () => {
    if (!canvasRef.canvas) return;

    state.particles = updateParticles(
      state.particles,
      config,
      canvasRef.canvas.width,
      canvasRef.canvas.height
    );

    draw();

    if (isPlaying) {
      state.animationId = requestAnimationFrame(() => animate());
    }
  };

  useVisibleTask$(({ track }) => {
    track(() => config);
    track(() => isPlaying);

    if (canvasRef.canvas) {
      initializeParticles();
    }

    if (isPlaying) {
      animate();
    } else if (state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }

    return () => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
    };
  });

  useVisibleTask$(() => {
    onReset$();
  });

  return (
    <canvas
      ref={(el) => {
        if (el) canvasRef.canvas = el;
      }}
      width={800}
      height={600}
      style={{
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    />
  );
});
