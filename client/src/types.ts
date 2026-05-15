export interface ButtonAnimationConfig {
  id?: string;
  name: string;
  baseStyle: BaseStyle;
  hoverStyle: HoverStyle;
  activeStyle: ActiveStyle;
  loadingStyle: LoadingStyle;
  successStyle: SuccessStyle;
  errorStyle: ErrorStyle;
  animation: AnimationConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: number;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow: string;
}

export interface HoverStyle {
  backgroundColor: string;
  textColor: string;
  scale: number;
  boxShadow: string;
  translateY: number;
}

export interface ActiveStyle {
  backgroundColor: string;
  scale: number;
  translateY: number;
}

export interface LoadingStyle {
  backgroundColor: string;
  spinnerColor: string;
  spinnerSize: number;
}

export interface SuccessStyle {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

export interface ErrorStyle {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

export interface AnimationConfig {
  type: 'spring' | 'tween';
  stiffness: number;
  damping: number;
  mass: number;
  duration: number;
  ease: string;
}

export type ButtonState = 'idle' | 'hover' | 'active' | 'loading' | 'success' | 'error';
