import React from 'react';

interface RulerProps {
  type: 'horizontal' | 'vertical';
  scale: number;
  panOffset: number;
  canvasSize: number;
  rulerSize: number;
}

const Ruler: React.FC<RulerProps> = ({ 
  type, 
  scale, 
  panOffset, 
  canvasSize: _canvasSize, 
  rulerSize 
}) => {
  const isHorizontal = type === 'horizontal';
  
  const generateTicks = () => {
    const ticks: { position: number; label: string; major: boolean }[] = [];
    const start = Math.floor(-panOffset / scale / 100) * 100;
    const end = start + Math.ceil((isHorizontal ? rulerSize : rulerSize) / scale / 100) * 100 + 200;
    
    for (let pos = start; pos <= end; pos += 20) {
      const isMajor = pos % 100 === 0;
      const screenPos = (pos + panOffset / scale) * scale;
      
      if (screenPos >= -50 && screenPos <= (isHorizontal ? rulerSize : rulerSize) + 50) {
        ticks.push({
          position: screenPos,
          label: isMajor ? `${pos}` : '',
          major: isMajor
        });
      }
    }
    
    return ticks;
  };

  const ticks = generateTicks();

  return (
    <div
      className={`absolute bg-gray-100 border-gray-300 flex-shrink-0 ${
        isHorizontal 
          ? 'h-6 border-b left-6 top-0 right-0' 
          : 'w-6 border-r top-6 left-0 bottom-0'
      }`}
      style={{
        position: 'absolute',
        zIndex: 10
      }}
    >
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #f5f5f5, #e8e8e8)'
        }}
      >
        {ticks.map((tick, index) => (
          <div
            key={index}
            className={`absolute ${isHorizontal ? 'top-0' : 'left-0'}`}
            style={{
              [isHorizontal ? 'left' : 'top']: tick.position,
              width: isHorizontal ? 1 : tick.major ? 16 : 10,
              height: isHorizontal ? (tick.major ? 16 : 10) : 1,
              backgroundColor: '#999'
            }}
          />
        ))}
        {ticks.filter(t => t.major).map((tick, index) => (
          <div
            key={`label-${index}`}
            className={`absolute text-xs text-gray-500 select-none pointer-events-none ${
              isHorizontal ? 'top-0' : 'left-0'
            }`}
            style={{
              [isHorizontal ? 'left' : 'top']: tick.position + 3,
              [isHorizontal ? 'top' : 'left']: isHorizontal ? 2 : undefined,
              transform: isHorizontal ? 'none' : 'rotate(-90deg) translateX(-100%)',
              transformOrigin: isHorizontal ? 'center' : 'top left',
              fontSize: '10px'
            }}
          >
            {tick.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ruler;
