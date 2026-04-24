import { X, Lightbulb, BookOpen, ChevronRight } from 'lucide-react';
import { Flame, FlaskConical, Wind, Zap, Plug } from 'lucide-react';
import type { Equipment } from '../types';

const iconMap: Record<string, typeof Flame> = {
  Flame,
  Kettle: FlaskConical,
  FlaskConical,
  Wind,
  Zap,
  Plug,
};

const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
  'primary-orange': {
    bg: 'bg-primary-orange/10',
    text: 'text-primary-orange',
    gradient: 'from-primary-orange to-primary-light-orange',
  },
  'primary-blue': {
    bg: 'bg-primary-blue/10',
    text: 'text-primary-blue',
    gradient: 'from-primary-blue to-primary-light-blue',
  },
  'primary-light-blue': {
    bg: 'bg-primary-light-blue/20',
    text: 'text-primary-blue',
    gradient: 'from-primary-blue to-primary-light-blue',
  },
};

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

export function EquipmentModal({ equipment, onClose }: EquipmentModalProps) {
  if (!equipment) return null;

  const IconComponent = iconMap[equipment.icon] || Zap;
  const colors = colorMap[equipment.color] || colorMap['primary-orange'];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${colors.gradient} p-6 md:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <IconComponent
                  className={`w-8 h-8 md:w-10 md:h-10 ${colors.text}`}
                  strokeWidth={2}
                />
              </div>
              <div className="pt-1">
                <h2 className="text-xl md:text-2xl font-bold text-white">{equipment.name}</h2>
                <span className="text-sm text-white/80">发电设备</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[55vh]">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-orange/10 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary-orange" fill="currentColor" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">大白话讲解</h3>
            </div>
            <div className="bg-gradient-to-r from-primary-orange/8 to-primary-light-orange/8 rounded-2xl p-5 md:p-6 border border-primary-orange/10">
              <p className="text-text-dark leading-relaxed text-sm md:text-base">
                {equipment.simpleDescription}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-blue" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">专业说明</h3>
            </div>
            <div className="bg-gradient-to-r from-primary-blue/5 to-primary-light-blue/5 rounded-2xl p-5 md:p-6 border border-primary-blue/10">
              <p className="text-text-medium leading-relaxed text-sm md:text-base">
                {equipment.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 border-t border-border-light bg-border-subtle/50">
          <button
            onClick={onClose}
            className={`w-full py-4 bg-gradient-to-r ${colors.gradient} text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2 group`}
          >
            <span>我知道啦</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
