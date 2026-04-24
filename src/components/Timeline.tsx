import { useRef, useState, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/timeUtils';

interface TimelineProps {
  currentTime: number;
  onTimeChange: (time: number) => void;
  sunrise: string;
  sunset: string;
}

export default function Timeline({ currentTime, onTimeChange, sunrise, sunset }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(currentTime);

  useEffect(() => {
    setLocalTime(currentTime);
  }, [currentTime]);

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * 24;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const time = getTimeFromPosition(e.clientX);
    setLocalTime(time);
    onTimeChange(time);
  }, [getTimeFromPosition, onTimeChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const time = getTimeFromPosition(e.touches[0].clientX);
    setLocalTime(time);
    onTimeChange(time);
  }, [getTimeFromPosition, onTimeChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(e.clientX);
      setLocalTime(time);
      onTimeChange(time);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(e.touches[0].clientX);
      setLocalTime(time);
      onTimeChange(time);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, getTimeFromPosition, onTimeChange]);

  const position = (localTime / 24) * 100;

  return (
    <div className="timeline-container">
      <div className="timeline-labels">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
      <div 
        ref={timelineRef}
        className="timeline-track"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="timeline-progress" style={{ width: `${position}%` }} />
        <div className="timeline-thumb" style={{ left: `${position}%` }}>
          <div className="timeline-tooltip">{formatTime(localTime)}</div>
        </div>
        <div className="timeline-marker sunrise" style={{ left: `${(parseInt(sunrise.split(':')[0]) + parseInt(sunrise.split(':')[1]) / 60) / 24 * 100}%` }}>
          <span>日出</span>
        </div>
        <div className="timeline-marker sunset" style={{ left: `${(parseInt(sunset.split(':')[0]) + parseInt(sunset.split(':')[1]) / 60) / 24 * 100}%` }}>
          <span>日落</span>
        </div>
      </div>
    </div>
  );
}
