import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { AnimationState, ArchitectureType } from '../types';
import { ANIMATION_STEPS } from '../types';

type Action =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_ARCHITECTURE'; payload: ArchitectureType }
  | { type: 'SET_ACTIVE_APP'; payload: string | null }
  | { type: 'SET_COMMUNICATION'; payload: { from: string; to: string; message: string } | null }
  | { type: 'TICK' };

const initialState: AnimationState = {
  currentStep: -1,
  isPlaying: false,
  isPaused: false,
  speed: 1,
  architectureType: 'microfrontend',
  activeApp: null,
  communicationData: null,
};

function animationReducer(state: AnimationState, action: Action): AnimationState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true, isPaused: false };
    case 'PAUSE':
      return { ...state, isPlaying: false, isPaused: true };
    case 'STOP':
      return { ...initialState };
    case 'NEXT_STEP':
      const nextStep = state.currentStep < ANIMATION_STEPS.length - 1 
        ? state.currentStep + 1 
        : state.currentStep;
      return { ...state, currentStep: nextStep, isPlaying: false };
    case 'PREV_STEP':
      const prevStep = state.currentStep > -1 ? state.currentStep - 1 : -1;
      return { ...state, currentStep: prevStep, isPlaying: false };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'SET_ARCHITECTURE':
      return { ...state, architectureType: action.payload };
    case 'SET_ACTIVE_APP':
      return { ...state, activeApp: action.payload };
    case 'SET_COMMUNICATION':
      return { ...state, communicationData: action.payload };
    case 'TICK':
      if (state.currentStep < ANIMATION_STEPS.length - 1) {
        return { ...state, currentStep: state.currentStep + 1 };
      }
      return { ...state, isPlaying: false };
    default:
      return state;
  }
}

interface AnimationContextType {
  state: AnimationState;
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setSpeed: (speed: number) => void;
  setArchitecture: (type: ArchitectureType) => void;
  setActiveApp: (appId: string | null) => void;
  setCommunication: (data: { from: string; to: string; message: string } | null) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(animationReducer, initialState);
  const intervalRef = useRef<number | null>(null);

  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const stop = useCallback(() => dispatch({ type: 'STOP' }), []);
  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const goToStep = useCallback((step: number) => dispatch({ type: 'GO_TO_STEP', payload: step }), []);
  const setSpeed = useCallback((speed: number) => dispatch({ type: 'SET_SPEED', payload: speed }), []);
  const setArchitecture = useCallback((type: ArchitectureType) => dispatch({ type: 'SET_ARCHITECTURE', payload: type }), []);
  const setActiveApp = useCallback((appId: string | null) => dispatch({ type: 'SET_ACTIVE_APP', payload: appId }), []);
  const setCommunication = useCallback((data: { from: string; to: string; message: string } | null) => dispatch({ type: 'SET_COMMUNICATION', payload: data }), []);

  useEffect(() => {
    if (state.isPlaying && state.currentStep < ANIMATION_STEPS.length) {
      const currentStepData = ANIMATION_STEPS[state.currentStep];
      if (!currentStepData) {
        dispatch({ type: 'TICK' });
        return;
      }

      const duration = currentStepData.duration / state.speed;
      
      intervalRef.current = window.setTimeout(() => {
        dispatch({ type: 'TICK' });
      }, duration);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [state.isPlaying, state.currentStep, state.speed]);

  const value: AnimationContextType = {
    state,
    play,
    pause,
    stop,
    nextStep,
    prevStep,
    goToStep,
    setSpeed,
    setArchitecture,
    setActiveApp,
    setCommunication,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
