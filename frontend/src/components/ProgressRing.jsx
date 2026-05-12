import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#ef4444',
];

export default function ProgressRing(props) {
  const {
    progress,
    size = 200,
    strokeWidth = 12,
    color = '#6366f1',
    bgColor = '#e5e7eb',
    showLabel = true,
    animated = true,
    duration = 1500,
    label = '',
    onMilestone = () => {},
  } = props;

  const [currentProgress, setCurrentProgress] = createSignal(0);
  const [displayProgress, setDisplayProgress] = createSignal(0);
  const [isHovered, setIsHovered] = createSignal(false);

  const radius = createMemo(() => (size - strokeWidth) / 2);
  const circumference = createMemo(() => 2 * Math.PI * radius());
  const offset = createMemo(() => circumference() * (1 - currentProgress() / 100));

  let animationFrame;
  let startTime;

  const animateProgress = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progressValue = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progressValue, 3);
    
    const targetProgress = progress;
    const startProgress = currentProgress();
    const newProgress = startProgress + (targetProgress - startProgress) * easeProgress;
    setCurrentProgress(newProgress);
    setDisplayProgress(Math.round(newProgress));

    if (progressValue < 1) {
      animationFrame = requestAnimationFrame(animateProgress);
    }
  };

  createEffect(() => {
    if (animated) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      startTime = null;
      animationFrame = requestAnimationFrame(animateProgress);
    } else {
      setCurrentProgress(progress);
      setDisplayProgress(progress);
    }
  });

  onCleanup(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  return (
    <div
      class={`progress-ring-wrapper ${isHovered() ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        class="progress-ring-svg"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          class="progress-ring-bg"
          stroke={bgColor}
          stroke-width={strokeWidth}
          fill="transparent"
          r={radius()}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          class="progress-ring-progress"
          stroke={color}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          fill="transparent"
          r={radius()}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference(),
            strokeDashoffset: offset(),
            transform: `rotate(-90deg)`,
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>
      {showLabel && (
        <div class="progress-ring-label">
          {label && <div class="progress-ring-label-text">{label}</div>}
          <div class="progress-ring-label-value">{displayProgress()}%</div>
        </div>
      )}
    </div>
  );
}

export { COLORS };
