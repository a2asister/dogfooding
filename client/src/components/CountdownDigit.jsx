import { createSignal, createEffect, onCleanup } from 'solid-js';
import { NUMBER_PATHS, interpolatePaths } from '../utils/numberPaths';

export default function CountdownDigit(props) {
  const [displayPaths, setDisplayPaths] = createSignal(NUMBER_PATHS[0] || []);
  const [glowIntensity, setGlowIntensity] = createSignal(0);
  let animationFrame = null;
  let startTime = 0;
  let fromPaths = NUMBER_PATHS[props.value] || [];
  
  createEffect(() => {
    const newPaths = NUMBER_PATHS[props.value] || [];
    if (JSON.stringify(fromPaths) !== JSON.stringify(newPaths)) {
      startTime = performance.now();
      const oldPaths = [...fromPaths];
      fromPaths = newPaths;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const duration = 600;
        let progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const interpolated = oldPaths.map((oldPath, i) => {
          const newPath = newPaths[i] || oldPath;
          return interpolatePaths(oldPath, newPath, easeProgress);
        });
        
        setDisplayPaths(interpolated);
        
        if (progress < 0.5) {
          setGlowIntensity(Math.sin(progress * Math.PI) * 1.5);
        }
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setGlowIntensity(0);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
  });
  
  onCleanup(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
  
  return (
    <svg 
      width="80" 
      height="100" 
      viewBox="0 0 100 100" 
      class="countdown-digit"
      style={{
        '--glow-intensity': glowIntensity(),
        filter: `drop-shadow(0 0 ${10 + glowIntensity() * 20}px #00f7ff) drop-shadow(0 0 ${20 + glowIntensity() * 30}px #0066ff)`
      }}
    >
      <defs>
        <linearGradient id={`digit-gradient-${props.value}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00f7ff" />
          <stop offset="50%" stop-color="#00ccff" />
          <stop offset="100%" stop-color="#0066ff" />
        </linearGradient>
        <filter id={`glow-${props.value}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {displayPaths().map((path, index) => (
        <path
          key={index}
          d={path}
          fill={index === 0 ? `url(#digit-gradient-${props.value})` : 'rgba(255,255,255,0.3)'}
          stroke="#00f7ff"
          stroke-width={index === 0 ? 0.5 : 0}
          filter={`url(#glow-${props.value})`}
        />
      ))}
    </svg>
  );
}
