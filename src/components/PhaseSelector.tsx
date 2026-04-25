import { motion } from 'framer-motion';
import { PhaseType } from '@/types';

interface PhaseSelectorProps {
  currentPhase: PhaseType;
  onPhaseChange: (phase: PhaseType) => void;
}

function PhaseSelector({ currentPhase, onPhaseChange }: PhaseSelectorProps) {
  const tabs: { id: PhaseType; label: string; icon: string; description: string }[] = [
    { 
      id: 'dev', 
      label: '开发模式', 
      icon: '🔧',
      description: '依赖预构建、ESBuild 转换、HMR 热更新'
    },
    { 
      id: 'build', 
      label: '生产构建', 
      icon: '📦',
      description: 'Rollup 打包、Tree Shaking、代码分割、资源优化'
    },
  ];

  return (
    <div className="bg-surface-elevated border-b border-border shrink-0">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPhaseChange(tab.id)}
              className="relative group"
            >
              <div
                className={`px-6 py-3 transition-all duration-200 ${
                  currentPhase === tab.id
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-semibold">{tab.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-80">{tab.description}</p>
              </div>
              {currentPhase === tab.id && (
                <motion.div
                  layoutId="phaseIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PhaseSelector;
