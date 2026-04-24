import { useState, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';
import { equipments } from '../data/equipments';
import { EquipmentIcon } from '../components/EquipmentIcon';
import { EquipmentModal } from '../components/EquipmentModal';
import { FlowAnimation } from '../components/FlowAnimation';
import type { Equipment, FlowStep } from '../types';

export function MainPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleStepChange = useCallback((step: FlowStep | null) => {
    if (step) {
      setActiveAnimation(step.equipmentId);
    } else {
      setActiveAnimation(null);
    }
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="mb-10">
        <div className="bg-gradient-to-r from-primary-blue/8 via-primary-light-blue/12 to-primary-blue/8 rounded-3xl p-7 md:p-9 border border-primary-blue/10">
          <div className="flex items-start gap-5">
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-primary-blue to-primary-light-blue rounded-2xl items-center justify-center flex-shrink-0 shadow-md">
              <PlayCircle className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-dark mb-4">
                火力发电全流程
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-text-medium leading-relaxed max-w-2xl">
                欢迎来到火力发电小课堂！点击下方的设备图标，了解每个设备的作用；或者点击「开始演示」观看完整发电过程~
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm md:text-base font-semibold text-text-medium uppercase tracking-wide">
            发电设备流程
          </h3>
          <span className="text-xs md:text-sm text-text-light">
            点击设备查看详情
          </span>
        </div>
        <div
          className="relative w-full h-72 md:h-96 lg:h-[500px] bg-gradient-to-b from-sky-50/80 via-blue-50/50 to-green-50/80 rounded-3xl overflow-hidden border border-primary-blue/15 shadow-card p-1"
        >
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary-light-blue/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-green-100/60 to-transparent" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="flowLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#FF9F43" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <line
              x1="12%"
              y1="50%"
              x2="88%"
              y2="50%"
              stroke="url(#flowLine)"
              strokeWidth="5"
              strokeDasharray="16,10"
              strokeLinecap="round"
            />
          </svg>

          {equipments.map((equipment, index) => (
            <div
              key={equipment.id}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="animate-fade-in-up"
            >
              <EquipmentIcon
                equipment={equipment}
                onClick={() => handleEquipmentClick(equipment)}
                isAnimating={isPlaying}
                animationKey={activeAnimation || undefined}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pb-6 md:pb-8">
        <FlowAnimation
          onStepChange={handleStepChange}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
        />
      </div>

      <div className="h-20 md:hidden" />

      <EquipmentModal
        equipment={selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />
    </div>
  );
}
