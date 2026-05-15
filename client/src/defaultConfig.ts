import { ButtonAnimationConfig } from './types';

export const defaultConfig: ButtonAnimationConfig = {
  name: '默认按钮',
  baseStyle: {
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    paddingX: 24,
    paddingY: 12,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#4f46e5',
    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
  },
  hoverStyle: {
    backgroundColor: '#4f46e5',
    textColor: '#ffffff',
    scale: 1.05,
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
    translateY: -2
  },
  activeStyle: {
    backgroundColor: '#4338ca',
    scale: 0.98,
    translateY: 0
  },
  loadingStyle: {
    backgroundColor: '#818cf8',
    spinnerColor: '#ffffff',
    spinnerSize: 20
  },
  successStyle: {
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    iconColor: '#ffffff'
  },
  errorStyle: {
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    iconColor: '#ffffff'
  },
  animation: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 1,
    duration: 0.3,
    ease: 'easeOut'
  }
};

export const presetTemplates: ButtonAnimationConfig[] = [
  {
    ...defaultConfig,
    name: '弹性按钮'
  },
  {
    name: '玻璃拟态按钮',
    baseStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#ffffff',
      fontSize: 16,
      fontWeight: 600,
      paddingX: 24,
      paddingY: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    hoverStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      textColor: '#ffffff',
      scale: 1.02,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
      translateY: -1
    },
    activeStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      scale: 0.99,
      translateY: 0
    },
    loadingStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      spinnerColor: '#ffffff',
      spinnerSize: 20
    },
    successStyle: {
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      textColor: '#ffffff',
      iconColor: '#ffffff'
    },
    errorStyle: {
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      textColor: '#ffffff',
      iconColor: '#ffffff'
    },
    animation: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 1,
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  {
    name: '渐变霓虹按钮',
    baseStyle: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      fontSize: 16,
      fontWeight: 700,
      paddingX: 28,
      paddingY: 14,
      borderRadius: 9999,
      borderWidth: 0,
      borderColor: 'transparent',
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)'
    },
    hoverStyle: {
      backgroundColor: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
      textColor: '#ffffff',
      scale: 1.08,
      boxShadow: '0 0 40px rgba(118, 75, 162, 0.6)',
      translateY: -3
    },
    activeStyle: {
      backgroundColor: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
      scale: 0.96,
      translateY: 0
    },
    loadingStyle: {
      backgroundColor: 'linear-gradient(135deg, #908df0 0%, #9f7aea 100%)',
      spinnerColor: '#ffffff',
      spinnerSize: 22
    },
    successStyle: {
      backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      textColor: '#ffffff',
      iconColor: '#ffffff'
    },
    errorStyle: {
      backgroundColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      textColor: '#ffffff',
      iconColor: '#ffffff'
    },
    animation: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.8,
      duration: 0.25,
      ease: 'easeOut'
    }
  }
];
