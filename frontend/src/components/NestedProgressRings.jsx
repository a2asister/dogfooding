import { createSignal, createMemo } from 'solid-js';
import { COLORS } from './ProgressRing';

export default function NestedProgressRings(props) {
  const { subjects, overallProgress } = props;
  const [hoveredIndex, setHoveredIndex] = createSignal(-1);
  const [tooltipData, setTooltipData] = createSignal(null);
  const [tooltipVisible, setTooltipVisible] = createSignal(false);

  const baseSize = 320;
  const ringsSpacing = 40;
  const strokeWidth = 10;

  const ringConfigs = createMemo(() => {
    const configs = [];
    const subjectsList = subjects || [];
    
    configs.push({
      index: -1,
      label: '总体',
      progress: overallProgress,
      size: baseSize,
      color: '#6366f1',
      isOverall: true,
    });

    subjectsList.forEach((subject, i) => {
      const size = baseSize - (i + 1) * ringsSpacing;
      if (size > 60) {
        configs.push({
          index: i,
          label: subject.subject,
          progress: subject.progress,
          size: size,
          color: COLORS[(i + 1) % COLORS.length],
          totalCourses: subject.totalCourses,
          completedCourses: subject.completedCourses,
          totalLessons: subject.totalLessons,
          completedLessons: subject.completedLessons,
          isOverall: false,
        });
      }
    });

    return configs;
  });

  const handleMouseEnter = (config, event) => {
    setHoveredIndex(config.index);
    setTooltipData({
      label: config.label,
      progress: config.progress,
      totalCourses: config.totalCourses || 0,
      completedCourses: config.completedCourses || 0,
      totalLessons: config.totalLessons || 0,
      completedLessons: config.completedLessons || 0,
    });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
    setTooltipVisible(false);
  };

  return (
    <div class="nested-rings-container">
      <div class="nested-rings-wrapper" style={{ width: `${baseSize}px`, height: `${baseSize}px` }}>
        {ringConfigs().map((config) => {
          const radius = (config.size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - config.progress / 100);
          const isHovered = hoveredIndex() === config.index;
          const scale = isHovered ? 1.08 : 1;

          return (
            <div
              class={`nested-ring-item ${isHovered ? 'hovered' : ''}`}
              style={{
                width: `${config.size}px`,
                height: `${config.size}px`,
                top: `${(baseSize - config.size) / 2}px`,
                left: `${(baseSize - config.size) / 2}px`,
                transform: `scale(${scale})`,
              }}
              onMouseEnter={(e) => handleMouseEnter(config, e)}
              onMouseLeave={handleMouseLeave}
            >
              <svg
                width={config.size}
                height={config.size}
                class="nested-ring-svg"
                viewBox={`0 0 ${config.size} ${config.size}`}
              >
                <circle
                  class="nested-ring-bg"
                  stroke="#e5e7eb"
                  stroke-width={strokeWidth}
                  fill="transparent"
                  r={radius}
                  cx={config.size / 2}
                  cy={config.size / 2}
                />
                <circle
                  class="nested-ring-progress"
                  stroke={config.color}
                  stroke-width={strokeWidth}
                  stroke-linecap="round"
                  fill="transparent"
                  r={radius}
                  cx={config.size / 2}
                  cy={config.size / 2}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: `rotate(-90deg)`,
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.8s ease-out',
                  }}
                />
              </svg>
            </div>
          );
        })}
      </div>

      <div class={`nested-tooltip ${tooltipVisible() ? 'visible' : ''}`}>
        {tooltipData() && (
          <>
            <div class="tooltip-title">{tooltipData().label}</div>
            <div class="tooltip-progress">{tooltipData().progress}%</div>
            {!tooltipData().isOverall && (
              <>
                <div class="tooltip-divider"></div>
                <div class="tooltip-row">
                  <span class="tooltip-label">课程数:</span>
                  <span class="tooltip-value">
                    {tooltipData().completedCourses}/{tooltipData().totalCourses}
                  </span>
                </div>
                <div class="tooltip-row">
                  <span class="tooltip-label">课时数:</span>
                  <span class="tooltip-value">
                    {tooltipData().completedLessons}/{tooltipData().totalLessons}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div class="nested-legend">
        {ringConfigs().slice(1).map((config, i) => (
          <div class="legend-item" key={i}>
            <div class="legend-color" style={{ background: config.color }}></div>
            <span class="legend-label">{config.label}</span>
            <span class="legend-value">{config.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
