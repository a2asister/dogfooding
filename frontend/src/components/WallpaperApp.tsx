import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useGravitySensor } from '~/hooks/useGravitySensor';
import { useParticleSystem } from '~/hooks/useParticleSystem';
import type { ScreenState } from '~/types';

export const WallpaperApp = component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement | null>(null);
  const screenState = useSignal<ScreenState>('locked');
  const pressPosition = useSignal<{ x: number; y: number } | null>(null);
  const scale = useSignal(1);

  const { gravityX, gravityY } = useGravitySensor(1.0);
  const { updateParticles, drawParticles, initParticles } = useParticleSystem(canvasRef, 80);

  useVisibleTask$(({ cleanup }) => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      const { width, height } = canvas;

      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(0.5, '#16213e');
      bgGradient.addColorStop(1, '#0f0f23');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const offsetX = gravityX.value * 20;
      const offsetY = gravityY.value * 20;

      ctx.save();
      if (pressPosition.value) {
        const dx = pressPosition.value.x - width / 2;
        const dy = pressPosition.value.y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(width * width + height * height) / 2;
        scale.value = 1 + (1 - distance / maxDistance) * 0.15;
        
        ctx.translate(pressPosition.value.x, pressPosition.value.y);
        ctx.scale(scale.value, scale.value);
        ctx.translate(-pressPosition.value.x, -pressPosition.value.y);
      }

      drawWallpaperPattern(ctx, width, height, offsetX, offsetY);
      ctx.restore();

      updateParticles(gravityX.value, gravityY.value, width, height);
      drawParticles(ctx);

      if (screenState.value === 'locked') {
        drawLockScreen(ctx, width, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    cleanup(() => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    });
  });

  const handleTouchStart$ = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      pressPosition.value = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd$ = () => {
    pressPosition.value = null;
  };

  const handleDoubleClick$ = () => {
    if (screenState.value === 'locked') {
      screenState.value = 'transitioning';
      setTimeout(() => {
        screenState.value = 'unlocked';
      }, 800);
    } else {
      screenState.value = 'locked';
    }
  };

  return (
    <div class="wallpaper-container">
      <canvas
        ref={canvasRef}
        onTouchStart$={handleTouchStart$}
        onTouchEnd$={handleTouchEnd$}
        onDblClick$={handleDoubleClick$}
      />
      <div class="ui-overlay">
        <p class="hint">双击 {screenState.value === 'locked' ? '解锁' : '锁定'}</p>
      </div>
    </div>
  );
});

function drawWallpaperPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number
) {
  const shapes = [
    { x: 0.2, y: 0.3, r: 150, c: '#667eea20' },
    { x: 0.8, y: 0.7, r: 200, c: '#764ba220' },
    { x: 0.5, y: 0.5, r: 180, c: '#f093fb15' },
    { x: 0.3, y: 0.8, r: 120, c: '#4facfe20' },
  ];

  shapes.forEach((shape) => {
    const gradient = ctx.createRadialGradient(
      shape.x * width + offsetX,
      shape.y * height + offsetY,
      0,
      shape.x * width + offsetX,
      shape.y * height + offsetY,
      shape.r
    );
    gradient.addColorStop(0, shape.c);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(shape.x * width + offsetX, shape.y * height + offsetY, shape.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < 5; i++) {
    const x = ((i * 0.2 + 0.1) * width + offsetX * 0.5) % width;
    const y = height / 2 + Math.sin(Date.now() / 2000 + i) * 50 + offsetY;
    
    ctx.beginPath();
    ctx.moveTo(x, y - 100);
    ctx.bezierCurveTo(x + 50, y - 50, x + 50, y + 50, x, y + 100);
    ctx.bezierCurveTo(x - 50, y + 50, x - 50, y - 50, x, y - 100);
    
    const gradient = ctx.createLinearGradient(x - 50, y - 100, x + 50, y + 100);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function drawLockScreen(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2 - 50;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if ('roundRect' in ctx) {
    ctx.roundRect(centerX - 40, centerY - 30, 80, 60, 10);
  } else {
    ctx.rect(centerX - 40, centerY - 30, 80, 60);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY - 10, 15, Math.PI, 0);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX, centerY + 10, 6, 0, Math.PI * 2);
  ctx.fill();
}