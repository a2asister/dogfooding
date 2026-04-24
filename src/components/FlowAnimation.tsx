import { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';
import { flowSteps } from '../data/flowSteps';
import type { FlowStep } from '../types';

interface FlowAnimationProps {
  onStepChange: (step: FlowStep | null) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export function FlowAnimation({
  onStepChange,
  isPlaying,
  onPlayingChange,
}: FlowAnimationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isPlaying) {
      if (currentStepIndex === -1) {
        setCurrentStepIndex(0);
        onStepChange(flowSteps[0]);
      } else if (currentStepIndex < flowSteps.length - 1) {
        timer = setTimeout(() => {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          onStepChange(flowSteps[nextIndex]);
        }, 2800);
      } else {
        onPlayingChange(false);
        onStepChange(null);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, onStepChange, onPlayingChange]);

  const handlePlay = () => {
    if (!isPlaying) {
      setCurrentStepIndex(-1);
      onPlayingChange(true);
    }
  };

  const handleReset = () => {
    onPlayingChange(false);
    setCurrentStepIndex(-1);
    onStepChange(null);
  };

  return (
    <div className="bg-white rounded-3xl p-7 md:p-10 shadow-card border border-border-light">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-primary-light-orange rounded-2xl flex items-center justify-center shadow-md">
            <Play className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-text-dark">互动演示</h3>
            <p className="text-sm text-text-light">点击开始观看完整发电过程</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-border-subtle hover:bg-border-light transition-colors text-text-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">重置</span>
          </button>
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isPlaying
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-orange to-primary-light-orange text-white hover:opacity-90 shadow-lg shadow-primary-orange/20'
            }`}
          >
            <Play className="w-4 h-4" fill="currentColor" />
            {isPlaying ? '演示中...' : '开始演示'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-5 px-3">
        {flowSteps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = index < currentStepIndex && currentStepIndex !== -1;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex flex-col items-center min-w-24 md:min-w-28 px-4 py-5 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-primary-orange/15 to-primary-light-orange/15 scale-105 shadow-md border border-primary-orange/20' 
                    : ''}
                  ${isPast 
                    ? 'bg-gradient-to-br from-primary-blue/10 to-primary-light-blue/10 border border-primary-blue/20' 
                    : ''}
                  ${!isActive && !isPast 
                    ? 'bg-border-subtle border border-transparent hover:border-border-light' 
                    : ''}
                `}
              >
                <div
                  className={`
                    w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-primary-orange to-primary-light-orange text-white shadow-lg animate-pulse-slow' 
                      : ''}
                    ${isPast 
                      ? 'bg-gradient-to-br from-primary-blue to-primary-light-blue text-white' 
                      : ''}
                    ${!isActive && !isPast 
                      ? 'bg-gray-200 text-text-light' 
                      : ''}
                  `}
                >
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <span
                  className={`text-xs md:text-sm font-semibold text-center leading-tight ${
                    isActive 
                      ? 'text-primary-orange' 
                      : isPast 
                        ? 'text-primary-blue' 
                        : 'text-text-medium'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < flowSteps.length - 1 && (
                <ChevronRight
                  className={`w-6 h-6 md:w-7 md:h-7 flex-shrink-0 mx-2 transition-colors duration-300 ${
                    isPast ? 'text-primary-blue' : 'text-border-light'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {currentStepIndex >= 0 && currentStepIndex < flowSteps.length && (
        <div className="mt-6 p-6 md:p-7 bg-gradient-to-r from-primary-orange/8 to-primary-light-orange/8 rounded-2xl border border-primary-orange/15 animate-fade-in">
          <p className="text-sm md:text-base text-text-dark leading-relaxed">
            <span className="inline-flex items-center gap-3 font-bold text-primary-orange mb-2">
              <span className="w-7 h-7 bg-primary-orange text-white rounded-full flex items-center justify-center text-sm">
                {currentStepIndex + 1}
              </span>
              {flowSteps[currentStepIndex].name}
            </span>
            <span className="block mt-3">{flowSteps[currentStepIndex].description}</span>
          </p>
        </div>
      )}
    </div>
  );
}
