import { useState, useEffect, useRef, useCallback } from 'react';
import { EventLoopSimulator } from '../core/EventLoopSimulator';
import type { 
  EventLoopState, 
  Task, 
  LoopConfig,
  PresetScenario,
} from '../types/eventLoop';
import { PRESET_SCENARIOS } from '../types/eventLoop';

export const useEventLoop = (initialConfig: LoopConfig) => {
  const [state, setState] = useState<EventLoopState>(() => {
    const tempSimulator = new EventLoopSimulator(initialConfig);
    return tempSimulator.getState();
  });
  
  const simulatorRef = useRef<EventLoopSimulator>(new EventLoopSimulator(initialConfig));

  useEffect(() => {
    const simulator = simulatorRef.current;
    
    simulator.setStateChangeListener((newState) => {
      setState(newState);
    });

    return () => {
      simulator.stop();
    };
  }, []);

  const addMacroTask = useCallback((task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>) => {
    simulatorRef.current.addMacroTask(task);
  }, []);

  const addMicroTask = useCallback((task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>) => {
    simulatorRef.current.addMicroTask(task);
  }, []);

  const start = useCallback(() => {
    simulatorRef.current.start();
  }, []);

  const pause = useCallback(() => {
    simulatorRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    simulatorRef.current.resume();
  }, []);

  const step = useCallback(() => {
    simulatorRef.current.step();
  }, []);

  const stop = useCallback(() => {
    simulatorRef.current.stop();
  }, []);

  const reset = useCallback(() => {
    simulatorRef.current.reset();
  }, []);

  const setConfig = useCallback((config: Partial<LoopConfig>) => {
    simulatorRef.current.setConfig(config);
  }, []);

  const loadScenario = useCallback((scenario: PresetScenario) => {
    reset();
    setConfig(scenario.config);
    
    scenario.tasks.forEach(task => {
      if (task.type === 'promise' || task.type === 'nextTick' || task.type === 'queueMicrotask') {
        addMicroTask(task);
      } else {
        addMacroTask(task);
      }
    });
  }, [reset, setConfig, addMacroTask, addMicroTask]);

  const saveCheckpoint = useCallback((name: string) => {
    simulatorRef.current.saveCheckpoint(name);
  }, []);

  const restoreCheckpoint = useCallback((name: string) => {
    simulatorRef.current.restoreCheckpoint(name);
  }, []);

  const getCheckpoints = useCallback(() => {
    return simulatorRef.current.getCheckpoints();
  }, []);

  const getPerformanceStats = useCallback(() => {
    return simulatorRef.current.getPerformanceStats();
  }, []);

  return {
    state,
    addMacroTask,
    addMicroTask,
    start,
    pause,
    resume,
    step,
    stop,
    reset,
    setConfig,
    loadScenario,
    saveCheckpoint,
    restoreCheckpoint,
    getCheckpoints,
    getPerformanceStats,
    presets: PRESET_SCENARIOS,
  };
};
