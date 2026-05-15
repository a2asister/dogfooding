import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Point, AnimationConfig } from '../types';
import { generateSmoothPath, snapToGrid, findNearestPoint, generateId } from '../utils/pathUtils';
import { animatePointMovement, animatePathMorph, applyMagneticSnap } from '../utils/animation';

interface CanvasProps {
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  config: AnimationConfig;
}

export const Canvas: React.FC<CanvasProps> = ({ points, onPointsChange, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (pathRef.current) {
      const pathData = generateSmoothPath(points);
      animatePathMorph(pathRef.current, pathData, 0.3);
    }
  }, [points]);

  const getMousePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    
    const pos = getMousePosition(e);
    const snapped = snapToGrid(pos.x, pos.y, 20);
    
    const newPoint: Point = {
      id: generateId(),
      x: snapped.x,
      y: snapped.y,
    };
    
    onPointsChange([...points, newPoint]);
  }, [getMousePosition, onPointsChange, points]);

  const handlePointMouseDown = useCallback((e: React.MouseEvent, point: Point) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedPointId(point.id);
    
    const pos = getMousePosition(e);
    setDragOffset({
      x: pos.x - point.x,
      y: pos.y - point.y,
    });
  }, [getMousePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedPointId) return;
    
    const pos = getMousePosition(e);
    let newX = pos.x - dragOffset.x;
    let newY = pos.y - dragOffset.y;
    
    const otherPoints = points.filter(p => p.id !== selectedPointId);
    const nearestPoint = findNearestPoint(newX, newY, otherPoints, config.snapDistance);
    
    if (nearestPoint) {
      newX = nearestPoint.x;
      newY = nearestPoint.y;
    }
    
    const element = document.querySelector(`[data-point-id="${selectedPointId}"]`) as HTMLElement;
    if (element) {
      animatePointMovement(element, newX, newY, 0.1);
      
      if (nearestPoint) {
        applyMagneticSnap({ id: selectedPointId, x: newX, y: newY }, nearestPoint, element);
      }
    }
    
    onPointsChange(
      points.map(p => 
        p.id === selectedPointId ? { ...p, x: newX, y: newY } : p
      )
    );
  }, [isDragging, selectedPointId, getMousePosition, dragOffset, points, config.snapDistance, onPointsChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent, pointId: string) => {
    e.stopPropagation();
    onPointsChange(points.filter(p => p.id !== pointId));
  }, [points, onPointsChange]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="canvas-container w-full h-full"
      onClick={handleCanvasClick}
      style={{ minHeight: '500px' }}
    >
      <div className="grid-overlay" />
      
      <svg className="path-svg">
        <path
          ref={pathRef}
          className="path-line"
          d={generateSmoothPath(points)}
        />
        {points.length >= 2 && (
          <path
            className="path-flow"
            d={generateSmoothPath(points)}
            style={{ animationDuration: `${2 / config.flowSpeed}s` }}
          />
        )}
      </svg>
      
      {points.map((point) => (
        <div
          key={point.id}
          data-point-id={point.id}
          className={`control-point ${selectedPointId === point.id ? 'selected' : ''} ${isDragging && selectedPointId === point.id ? 'dragging' : ''}`}
          style={{ left: point.x, top: point.y }}
          onMouseDown={(e) => handlePointMouseDown(e, point)}
          onDoubleClick={(e) => handleDoubleClick(e, point.id)}
        />
      ))}
    </div>
  );
};