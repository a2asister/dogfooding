import { Flame, FlaskConical, Wind, Zap, Plug } from 'lucide-react';
import type { Equipment } from '../types';

interface EquipmentIconProps {
  equipment: Equipment;
  onClick: () => void;
  isAnimating?: boolean;
  animationKey?: string;
}

const iconMap: Record<string, typeof Flame> = {
  Flame,
  Kettle: FlaskConical,
  FlaskConical,
  Wind,
  Zap,
  Plug,
};

const colorMap: Record<string, { bg: string; icon: string; border: string; hoverBg: string }> = {
  'primary-orange': {
    bg: 'bg-primary-orange/15',
    icon: 'text-primary-orange',
    border: 'border-primary-orange/25',
    hoverBg: 'hover:bg-primary-orange/25',
  },
  'primary-blue': {
    bg: 'bg-primary-blue/15',
    icon: 'text-primary-blue',
    border: 'border-primary-blue/25',
    hoverBg: 'hover:bg-primary-blue/25',
  },
  'primary-light-blue': {
    bg: 'bg-primary-light-blue/20',
    icon: 'text-primary-blue',
    border: 'border-primary-light-blue/30',
    hoverBg: 'hover:bg-primary-light-blue/30',
  },
};

export function EquipmentIcon({
  equipment,
  onClick,
  isAnimating,
  animationKey,
}: EquipmentIconProps) {
  const IconComponent = iconMap[equipment.icon] || Zap;
  const colors = colorMap[equipment.color] || colorMap['primary-orange'];

  const getAnimationClass = () => {
    if (!isAnimating || animationKey !== equipment.id) return '';
    switch (equipment.id) {
      case 'fuel':
        return 'animate-flame';
      case 'boiler':
        return 'animate-pulse-slow';
      case 'turbine':
        return 'animate-spin-slow';
      case 'generator':
        return 'animate-bounce-slow';
      case 'transformer':
        return 'animate-pulse-slow';
      default:
        return '';
    }
  };

  const isActive = isAnimating && animationKey === equipment.id;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
        rounded-2xl border-2
        ${colors.bg}
        ${colors.icon}
        ${colors.border}
        ${colors.hoverBg}
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        cursor-pointer
        group
        ${getAnimationClass()}
        ${isActive ? 'shadow-lg shadow-primary-orange/20 scale-105' : ''}
      `}
      style={{
        left: `${equipment.position.x}%`,
        top: `${equipment.position.y}%`,
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
      }}
    >
      <div className={`transition-all duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
        <IconComponent
          className={`w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 ${isActive ? 'drop-shadow-md' : ''}`}
          strokeWidth={2}
          fill={isActive ? 'currentColor' : 'none'}
        />
      </div>
      <span className="absolute -bottom-10 text-xs font-semibold text-text-medium whitespace-nowrap group-hover:text-primary-blue transition-colors">
        {equipment.name}
      </span>
      {isActive && (
        <>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-orange rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-orange rounded-full" />
        </>
      )}
    </button>
  );
}
