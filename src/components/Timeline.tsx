import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { MIN_YEAR, MAX_YEAR, yearToPosition, positionToYear } from '../utils/constants';
import { timelineMarkers } from '../data/techNodes';
import './Timeline.css';

interface TimelineProps {
  height?: number;
}

export function Timeline({ height = 80 }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const {
    state,
    dispatch,
    currentYear,
    activeMarkers,
    jumpToYear,
    togglePlaying,
  } = useAppContext();

  const animationRef = useRef(state.animation);

  useEffect(() => {
    animationRef.current = state.animation;
  }, [state.animation]);

  const { animation } = state;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!animation.isPlaying) return;

    const interval = setInterval(() => {
      const currentAnim = animationRef.current;
      let newTime = currentAnim.currentTime + 50 * currentAnim.playbackSpeed;
      
      if (newTime >= currentAnim.totalDuration) {
        if (currentAnim.isLooping) {
          newTime = 0;
        } else {
          dispatch({ type: 'SET_PLAYING', payload: false });
          newTime = currentAnim.totalDuration;
        }
      }
      
      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });
    }, 50);

    return () => clearInterval(interval);
  }, [animation.isPlaying, dispatch]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMouseMove(e);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!isDragging && e.type === 'mousemove') return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const year = positionToYear(x, containerWidth);
      jumpToYear(year);
    },
    [isDragging, containerWidth, jumpToYear]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const currentPosition = yearToPosition(currentYear, containerWidth);

  const visibleMarkers = timelineMarkers.filter((marker) => {
    const markerX = yearToPosition(parseInt(marker.date), containerWidth);
    return markerX >= 0 && markerX <= containerWidth;
  });

  const yearTicks = [];
  const step = containerWidth > 800 ? 5 : containerWidth > 500 ? 10 : 20;
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += step) {
    yearTicks.push({
      year,
      position: yearToPosition(year, containerWidth),
    });
  }

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      style={{ height }}
      onMouseDown={handleMouseDown}
    >
      <div className="timeline-track">
        <div className="timeline-progress" style={{ width: `${currentPosition}px` }} />

        {yearTicks.map((tick) => (
          <div
            key={tick.year}
            className="timeline-tick"
            style={{ left: `${tick.position}px` }}
          >
            <div className="timeline-tick-line" />
            <span className="timeline-tick-label">{tick.year}</span>
          </div>
        ))}

        {visibleMarkers.map((marker) => {
          const markerX = yearToPosition(parseInt(marker.date), containerWidth);
          const isActive = activeMarkers.some((m) => m.id === marker.id);

          return (
            <div
              key={marker.id}
              className={`timeline-marker ${isActive ? 'active' : ''} ${marker.importance}`}
              style={{ left: `${markerX}px` }}
              title={marker.label}
              onClick={(e) => {
                e.stopPropagation();
                jumpToYear(parseInt(marker.date));
              }}
            >
              <div className="timeline-marker-dot" />
              {isActive && (
                <div className="timeline-marker-tooltip animate-fade-in">
                  {marker.label}
                </div>
              )}
            </div>
          );
        })}

        <div
          className="timeline-handle"
          style={{ left: `${currentPosition}px` }}
        >
          <div className="timeline-handle-line" />
          <div className="timeline-handle-dot">
            <span className="timeline-handle-year">{currentYear}</span>
          </div>
        </div>
      </div>

      <div className="timeline-controls">
        <button
          className="timeline-control-btn"
          onClick={() => jumpToYear(MIN_YEAR)}
          title="回到起点"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          className="timeline-control-btn play-btn"
          onClick={togglePlaying}
          title={animation.isPlaying ? '暂停' : '播放'}
        >
          {animation.isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          className="timeline-control-btn"
          onClick={() => jumpToYear(MAX_YEAR)}
          title="到终点"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <div className="timeline-speed-control">
          <button
            className={`timeline-speed-btn ${animation.playbackSpeed === 0.5 ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PLAYBACK_SPEED', payload: 0.5 })}
          >
            0.5x
          </button>
          <button
            className={`timeline-speed-btn ${animation.playbackSpeed === 1 ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PLAYBACK_SPEED', payload: 1 })}
          >
            1x
          </button>
          <button
            className={`timeline-speed-btn ${animation.playbackSpeed === 2 ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PLAYBACK_SPEED', payload: 2 })}
          >
            2x
          </button>
        </div>

        <button
          className={`timeline-control-btn ${animation.isLooping ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_LOOPING', payload: !animation.isLooping })}
          title={animation.isLooping ? '关闭循环' : '开启循环'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
