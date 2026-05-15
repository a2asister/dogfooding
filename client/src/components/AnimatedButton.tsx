import { useState, memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ButtonAnimationConfig, ButtonState } from '../types';

interface AnimatedButtonProps {
  config: ButtonAnimationConfig;
  onClick?: () => void;
  forceState?: ButtonState;
}

export const AnimatedButton = memo(function AnimatedButton({ config, onClick, forceState }: AnimatedButtonProps) {
  const [internalState, setInternalState] = useState<ButtonState>('idle');
  
  useEffect(() => {
    if (forceState !== undefined) {
      setInternalState(forceState);
    } else {
      setInternalState('idle');
    }
  }, [forceState]);
  
  const currentState = forceState !== undefined ? forceState : internalState;

  const getAnimationTransition = () => {
    const { animation } = config;
    if (animation.type === 'spring') {
      return {
        type: 'spring' as const,
        stiffness: animation.stiffness,
        damping: animation.damping,
        mass: animation.mass
      };
    }
    return {
      duration: animation.duration,
      ease: animation.ease
    };
  };

  const getCurrentStyle = () => {
    const { baseStyle, hoverStyle, activeStyle, loadingStyle, successStyle, errorStyle } = config;
    
    switch (currentState) {
      case 'hover':
        return {
          backgroundColor: hoverStyle.backgroundColor,
          color: hoverStyle.textColor,
          scale: hoverStyle.scale,
          boxShadow: hoverStyle.boxShadow,
          y: hoverStyle.translateY
        };
      case 'active':
        return {
          backgroundColor: activeStyle.backgroundColor,
          color: baseStyle.textColor,
          scale: activeStyle.scale,
          y: activeStyle.translateY
        };
      case 'loading':
        return {
          backgroundColor: loadingStyle.backgroundColor,
          color: baseStyle.textColor
        };
      case 'success':
        return {
          backgroundColor: successStyle.backgroundColor,
          color: successStyle.textColor
        };
      case 'error':
        return {
          backgroundColor: errorStyle.backgroundColor,
          color: errorStyle.textColor
        };
      default:
        return {
          backgroundColor: baseStyle.backgroundColor,
          color: baseStyle.textColor,
          scale: 1,
          boxShadow: baseStyle.boxShadow,
          y: 0
        };
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (forceState === undefined && internalState === 'idle') {
      setInternalState('hover');
    }
  }, [forceState, internalState]);

  const handleMouseLeave = useCallback(() => {
    if (forceState === undefined && (internalState === 'hover' || internalState === 'active')) {
      setInternalState('idle');
    }
  }, [forceState, internalState]);

  const handleMouseDown = useCallback(() => {
    if (forceState === undefined) {
      setInternalState('active');
    }
  }, [forceState]);

  const handleMouseUp = useCallback(() => {
    if (forceState === undefined) {
      setInternalState('hover');
    }
  }, [forceState]);

  const handleClick = useCallback(() => {
    if (forceState === undefined && onClick) {
      onClick();
    }
  }, [forceState, onClick]);

  const style = getCurrentStyle();
  const transition = getAnimationTransition();

  return (
    <motion.button
      style={{
        padding: `${config.baseStyle.paddingY}px ${config.baseStyle.paddingX}px`,
        fontSize: `${config.baseStyle.fontSize}px`,
        fontWeight: config.baseStyle.fontWeight,
        borderRadius: `${config.baseStyle.borderRadius}px`,
        borderWidth: `${config.baseStyle.borderWidth}px`,
        borderStyle: 'solid',
        borderColor: config.baseStyle.borderColor,
        cursor: currentState === 'loading' ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minWidth: '120px',
        userSelect: 'none',
        outline: 'none'
      }}
      animate={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        scale: (style as any).scale || 1,
        boxShadow: (style as any).boxShadow || config.baseStyle.boxShadow,
        y: (style as any).y !== undefined ? (style as any).y : 0
      }}
      transition={transition}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      disabled={currentState === 'loading'}
    >
      <AnimatePresence mode="wait">
        {currentState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: `${config.loadingStyle.spinnerSize}px`,
              height: `${config.loadingStyle.spinnerSize}px`,
              border: '2px solid transparent',
              borderTopColor: config.loadingStyle.spinnerColor,
              borderLeftColor: config.loadingStyle.spinnerColor,
              borderRadius: '50%'
            }}
          />
        )}
        {currentState === 'success' && (
          <motion.svg
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config.successStyle.iconColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
        {currentState === 'error' && (
          <motion.svg
            key="error"
            initial={{ opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={transition}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config.errorStyle.iconColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </motion.svg>
        )}
        {currentState === 'idle' || currentState === 'hover' || currentState === 'active' ? (
          <motion.span
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {config.name}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';
