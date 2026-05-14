import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Ruler.scss';

interface RulerProps {
  pixelsPerUnit: number;
  unit: string;
  onMeasurement: (value: number) => void;
}

const Ruler: React.FC<RulerProps> = ({ pixelsPerUnit, unit, onMeasurement }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [measurement, setMeasurement] = useState<number | null>(null);
  const [previewMeasurement, setPreviewMeasurement] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [snapValue, setSnapValue] = useState<number | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollX(e.currentTarget.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const rawValue = x / pixelsPerUnit;
    const snapped = Math.round(rawValue * 10) / 10;
    setSnapValue(snapped);

    if (isDragging && dragStart !== null) {
      const dist = Math.abs(x - dragStart);
      const measuredValue = Math.round((dist / pixelsPerUnit) * 100) / 100;
      setPreviewMeasurement(measuredValue);
    }
  }, [scrollX, pixelsPerUnit, isDragging, dragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    setIsDragging(true);
    setDragStart(x);
    setMeasurement(null);
  }, [scrollX]);

  const handleMouseUp = useCallback(() => {
    if (previewMeasurement !== null) {
      setMeasurement(previewMeasurement);
      onMeasurement(previewMeasurement);
    }
    setIsDragging(false);
    setDragStart(null);
    setPreviewMeasurement(null);
  }, [previewMeasurement, onMeasurement]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging && previewMeasurement !== null) {
      setMeasurement(previewMeasurement);
      onMeasurement(previewMeasurement);
    }
    setIsDragging(false);
    setDragStart(null);
    setPreviewMeasurement(null);
  }, [isDragging, previewMeasurement, onMeasurement]);

  const generateTicks = useCallback(() => {
    const ticks = [];
    const startTick = Math.floor(scrollX / pixelsPerUnit) - 1;
    const endTick = startTick + 50;

    for (let i = startTick; i <= endTick; i++) {
      const position = i * pixelsPerUnit;
      const isMajor = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMajor;

      ticks.push(
        <div
          key={i}
          className={`ruler-tick ${isMajor ? 'major' : isHalf ? 'half' : 'minor'}`}
          style={{ left: position }}
        >
          {isMajor && (
            <span className="tick-label">{i}</span>
          )}
        </div>
      );
    }
    return ticks;
  }, [scrollX, pixelsPerUnit]);

  return (
    <div className="ruler-container">
      <div
        ref={containerRef}
        className="ruler-scroll"
        onScroll={handleScroll}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="ruler-track">
          {generateTicks()}
          
          <AnimatePresence>
            <motion.div
              className="cursor-line"
              style={{ 
                left: mousePos.x,
                height: isDragging ? '100%' : '60px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <div className="line-glow" />
              {snapValue !== null && (
                <motion.div
                  className="value-badge"
                  initial={{ scale: 0.8, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  key={snapValue}
                >
                  {snapValue} {unit}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {isDragging && dragStart !== null && (
            <>
              <motion.div
                className="drag-start"
                style={{ left: dragStart }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
              <motion.div
                className="highlight-area"
                style={{
                  left: Math.min(dragStart, mousePos.x),
                  width: Math.abs(mousePos.x - dragStart),
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewMeasurement !== null && isDragging && (
          <motion.div
            className="measurement-display preview"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            key={`preview-${previewMeasurement}`}
          >
            <span className="preview-label">预览中</span>
            <span className="measurement-value">{previewMeasurement}</span>
            <span className="measurement-unit">{unit}</span>
          </motion.div>
        )}
        {measurement !== null && !isDragging && (
          <motion.div
            className="measurement-display"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            key={`final-${measurement}`}
          >
            <span className="measurement-value">{measurement}</span>
            <span className="measurement-unit">{unit}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ruler;
