import React, { useState } from 'react';
import { CareType } from '../types';

interface CareButtonProps {
  type: Exclude<CareType, 'photo'>;
  onClick: () => void;
  disabled?: boolean;
}

const buttonConfig: Record<Exclude<CareType, 'photo'>, {
  gradient: string;
  icon: string;
  label: string;
}> = {
  watering: {
    gradient: 'care-btn-water',
    icon: '💧',
    label: '浇水'
  },
  fertilizing: {
    gradient: 'care-btn-fert',
    icon: '🌾',
    label: '施肥'
  },
  pruning: {
    gradient: 'care-btn-prune',
    icon: '✂️',
    label: '修剪'
  }
};

export function CareButton({ type, onClick, disabled }: CareButtonProps) {
  const [isGlowing, setIsGlowing] = useState(false);
  const config = buttonConfig[type];

  const handleClick = () => {
    if (disabled) return;
    setIsGlowing(true);
    onClick();
    setTimeout(() => setIsGlowing(false), 800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`care-btn ${config.gradient} ${isGlowing ? 'care-btn-glow' : ''} 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex flex-col items-center gap-1 group`}
    >
      <span className="text-xl transform group-hover:scale-110 transition-transform">
        {config.icon}
      </span>
      <span className="text-xs font-medium opacity-90">
        {config.label}
      </span>
    </button>
  );
}