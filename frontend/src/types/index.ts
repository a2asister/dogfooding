export interface WallpaperData {
  id: number;
  name: string;
  filePath: string;
  originalWidth?: number;
  originalHeight?: number;
  adaptationParams?: Record<string, any>;
}

export interface DeviceConfig {
  screenWidth: number;
  screenHeight: number;
  microMovement: number;
  gravitySensitivity: number;
  pressIntensity: number;
  transitionSpeed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export type ScreenState = 'locked' | 'unlocked' | 'transitioning';