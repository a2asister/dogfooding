import React, { useState, useEffect, useRef } from 'react';

interface FlipNumberProps {
  value: number;
  isUrgent?: boolean;
}

const FlipNumber: React.FC<FlipNumberProps> = ({ value, isUrgent }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== displayValue) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsFlipping(true);
      setPrevValue(displayValue);
      setDisplayValue(value);
      timeoutRef.current = setTimeout(() => setIsFlipping(false), 600);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const formatValue = (v: number) => String(v).padStart(2, '0');

  const urgentStyle = isUrgent
    ? {
        background: 'linear-gradient(145deg, #c0392b, #8b0000)',
        animation: 'pulse 0.5s infinite',
      }
    : {};

  return (
    <div className={`flip-card ${isFlipping ? 'flipping' : ''}`}>
      <div className="flip-card-inner">
        <div className="flip-card-front" style={urgentStyle}>
          {formatValue(displayValue)}
        </div>
        <div className="flip-card-back" style={urgentStyle}>
          {formatValue(prevValue)}
        </div>
      </div>
    </div>
  );
};

export default FlipNumber;
