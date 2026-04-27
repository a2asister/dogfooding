import { useState, useMemo, useCallback } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import type { RoadSegment, Intersection, SignalState, RoadStatus } from '@/types';
import styles from './RoadMap.module.css';

const STATUS_COLORS: Record<RoadStatus, string> = {
  normal: '#22c55e',
  congested: '#f59e0b',
  blocked: '#ef4444',
  unknown: '#6b7280',
};

const SIGNAL_COLORS: Record<SignalState, string> = {
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#f59e0b',
};

function RoadSegmentComponent({ road }: { road: RoadSegment }) {
  const { startPoint, endPoint, lanes } = road;
  const statusColor = STATUS_COLORS[road.status];

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  const unitX = dx / length;
  const unitY = dy / length;

  const roadHalfWidth = (lanes * 4) / 2;
  const labelOffset = roadHalfWidth + 18;

  let offsetX: number, offsetY: number;
  if (isHorizontal) {
    offsetX = 0;
    offsetY = -labelOffset;
  } else {
    offsetX = -labelOffset;
    offsetY = 0;
  }

  const segmentLength = length;
  const startRatio = 0.25;
  const endRatio = 0.75;
  const labelStartX = startPoint.x + unitX * segmentLength * startRatio;
  const labelStartY = startPoint.y + unitY * segmentLength * startRatio;
  const labelEndX = startPoint.x + unitX * segmentLength * endRatio;
  const labelEndY = startPoint.y + unitY * segmentLength * endRatio;

  const labelX = (labelStartX + labelEndX) / 2 + offsetX;
  const labelY = (labelStartY + labelEndY) / 2 + offsetY;

  return (
    <g className={styles.roadSegment}>
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={statusColor}
        strokeWidth={lanes * 4}
        strokeLinecap="round"
      />

      <rect
        x={labelX - 35}
        y={labelY - 16}
        width={70}
        height={32}
        rx={5}
        fill="rgba(17, 24, 39, 0.9)"
        className={styles.labelBg}
      />

      <text
        x={labelX}
        y={labelY - 3}
        className={styles.roadLabel}
        textAnchor="middle"
      >
        {road.name}
      </text>
      <text
        x={labelX}
        y={labelY + 10}
        className={styles.roadSpeed}
        textAnchor="middle"
      >
        {road.currentSpeed} km/h
      </text>
    </g>
  );
}

function IntersectionComponent({
  intersection,
  onHover,
  onLeave,
}: {
  intersection: Intersection;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  const { coordinate, name, signalState } = intersection;
  const signalColor = SIGNAL_COLORS[signalState];
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover(intersection.id);
  }, [intersection.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onLeave();
  }, [onLeave]);

  const outerRadius = isHovered ? 28 : 24;
  const innerRadius = isHovered ? 14 : 10;
  const glowRadius = 40;

  const labelY = coordinate.y + 48;

  return (
    <g
      className={styles.intersection}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <circle
        cx={coordinate.x}
        cy={coordinate.y}
        r={glowRadius}
        fill={signalColor}
        opacity={isHovered ? 0.15 : 0}
        className={styles.glowCircle}
      />

      <circle
        cx={coordinate.x}
        cy={coordinate.y}
        r={outerRadius}
        fill="#1f2937"
        stroke={signalColor}
        strokeWidth={4}
      />

      <circle
        cx={coordinate.x}
        cy={coordinate.y}
        r={innerRadius}
        fill={signalColor}
      />

      <text
        x={coordinate.x}
        y={labelY}
        className={styles.intersectionLabel}
        fill="#e5e7eb"
        textAnchor="middle"
        style={{ opacity: isHovered ? 1 : 0.85 }}
      >
        {name}
      </text>

      {isHovered && (
        <text
          x={coordinate.x}
          y={labelY + 16}
          className={styles.intersectionSignal}
          fill={signalColor}
          textAnchor="middle"
        >
          {signalState === 'red' ? '红灯' : signalState === 'green' ? '绿灯' : '黄灯'}
        </text>
      )}
    </g>
  );
}

export function RoadMap() {
  const roads = useTrafficStore((state) => state.roads);
  const intersections = useTrafficStore((state) => state.intersections);
  const alarms = useTrafficStore((state) => state.alarms);

  const accidentLocations = useMemo(() => {
    return alarms
      .filter((alarm) => alarm.type === 'accident' && alarm.status !== 'resolved')
      .map((alarm) => alarm.location);
  }, [alarms]);

  const handleIntersectionHover = useCallback((_id: string) => {
  }, []);

  const handleIntersectionLeave = useCallback(() => {
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>路况实时监控</h2>
      <svg
        viewBox="0 0 1000 700"
        className={styles.map}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="0"
          y="0"
          width="1000"
          height="700"
          fill="#111827"
        />

        {roads.map((road) => (
          <RoadSegmentComponent key={road.id} road={road} />
        ))}

        {intersections.map((intersection) => (
          <IntersectionComponent
            key={intersection.id}
            intersection={intersection}
            onHover={handleIntersectionHover}
            onLeave={handleIntersectionLeave}
          />
        ))}

        {accidentLocations.map((location, index) => (
          <g key={index} className={styles.accidentMarker}>
            <circle
              cx={location.x}
              cy={location.y}
              r={15}
              fill="#ef4444"
              opacity={0.6}
            />
            <text
              x={location.x}
              y={location.y + 5}
              fill="white"
              fontSize="16"
              textAnchor="middle"
            >
              !
            </text>
          </g>
        ))}

        <g className={styles.legend}>
          <rect x="820" y="50" width="150" height="140" fill="#1f2937" rx="8" />
          <text x="840" y="75" fill="#e5e7eb" fontSize="12">图例</text>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <g key={status} transform={`translate(840, ${95 + Object.keys(STATUS_COLORS).indexOf(status) * 25})`}>
              <circle cx="5" cy="0" r="6" fill={color} />
              <text x="20" y="4" fill="#9ca3af" fontSize="11">
                {status === 'normal' ? '畅通' : status === 'congested' ? '拥堵' : status === 'blocked' ? '封闭' : '未知'}
              </text>
            </g>
          ))}
          <line x1="840" y1="195" x2="870" y2="195" stroke="#3b82f6" strokeWidth="4" />
          <text x="880" y="199" fill="#3b82f6" fontSize="11">事故点</text>
        </g>
      </svg>
    </div>
  );
}