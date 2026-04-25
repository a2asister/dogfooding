import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import { PhaseType, ControlState } from '@/types';
import { getPhaseSteps } from '@/data/animationSteps';
import DevFlow from '@/components/DevFlow';
import BuildFlow from '@/components/BuildFlow';
import Controls from '@/components/Controls';
import StepInfo from '@/components/StepInfo';
import PhaseSelector from '@/components/PhaseSelector';
import Header from '@/components/Header';

function App() {
  const [controlState, setControlState] = useState<ControlState>({
    isPlaying: false,
    currentStepIndex: 0,
    speed: 1,
    currentPhase: 'dev',
  });

  const timerRef = useRef<number | null>(null);
  const currentSteps = getPhaseSteps(controlState.currentPhase);
  const currentStep = currentSteps[controlState.currentStepIndex];

  useEffect(() => {
    if (controlState.isPlaying) {
      const duration = currentStep ? currentStep.duration / controlState.speed : 3000;
      
      timerRef.current = window.setTimeout(() => {
        if (controlState.currentStepIndex < currentSteps.length - 1) {
          setControlState(prev => ({
            ...prev,
            currentStepIndex: prev.currentStepIndex + 1,
          }));
        } else {
          setControlState(prev => ({
            ...prev,
            isPlaying: false,
          }));
        }
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [controlState.isPlaying, controlState.currentStepIndex, controlState.speed, currentStep, currentSteps.length]);

  const handlePlayPause = () => {
    setControlState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handlePrev = () => {
    setControlState(prev => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  };

  const handleNext = () => {
    setControlState(prev => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: Math.min(currentSteps.length - 1, prev.currentStepIndex + 1),
    }));
  };

  const handleReset = () => {
    setControlState(prev => ({
      ...prev,
      isPlaying: false,
      currentStepIndex: 0,
    }));
  };

  const handleSpeedChange = (speed: 0.5 | 1 | 1.5 | 2) => {
    setControlState(prev => ({
      ...prev,
      speed,
    }));
  };

  const handlePhaseChange = (phase: PhaseType) => {
    setControlState(prev => ({
      ...prev,
      currentPhase: phase,
      currentStepIndex: 0,
      isPlaying: false,
    }));
  };

  const handleStepClick = (index: number) => {
    setControlState(prev => ({
      ...prev,
      currentStepIndex: index,
      isPlaying: false,
    }));
  };

  const progress = ((controlState.currentStepIndex + 1) / currentSteps.length) * 100;

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <Header />
      
      <PhaseSelector 
        currentPhase={controlState.currentPhase}
        onPhaseChange={handlePhaseChange}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={controlState.currentPhase}
                initial={{ opacity: 0, x: controlState.currentPhase === 'build' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: controlState.currentPhase === 'build' ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {controlState.currentPhase === 'dev' ? (
                  <DevFlow 
                    currentStepKey={currentStep?.key || ''}
                    isPlaying={controlState.isPlaying}
                  />
                ) : (
                  <BuildFlow 
                    currentStepKey={currentStep?.key || ''}
                    isPlaying={controlState.isPlaying}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-96 border-l border-border bg-surface-elevated overflow-hidden flex flex-col">
            <StepInfo 
              step={currentStep}
              steps={currentSteps}
              currentIndex={controlState.currentStepIndex}
              onStepClick={handleStepClick}
              progress={progress}
            />
          </div>
        </div>

        <Controls 
          isPlaying={controlState.isPlaying}
          speed={controlState.speed}
          currentIndex={controlState.currentStepIndex}
          totalSteps={currentSteps.length}
          onPlayPause={handlePlayPause}
          onPrev={handlePrev}
          onNext={handleNext}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
        />
      </main>
    </div>
  );
}

export default App;
