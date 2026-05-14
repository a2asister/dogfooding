import { motion } from 'framer-motion';

interface FlowLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  trigger: boolean;
}

export function FlowLine({ startX, startY, endX, endY, trigger }: FlowLineProps) {
  if (!trigger) return null;

  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 50;

  return (
    <svg className="fixed inset-0 pointer-events-none z-40" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ecdc4" />
          <stop offset="50%" stopColor="#45b7d1" />
          <stop offset="100%" stopColor="#96ceb4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          strokeDasharray: '10 5',
        }}
      />
      <motion.circle
        r="8"
        fill="#4ecdc4"
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ['0%', '100%'],
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          offsetPath: `path('M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}')`,
        }}
      />
    </svg>
  );
}
