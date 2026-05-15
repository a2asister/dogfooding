export interface PageElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  backgroundColor?: string;
  fontSize?: number;
  color?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
}

export interface AnimationTrigger {
  id: string;
  elementId: string;
  type: 'fadeIn' | 'slideIn' | 'scale' | 'rotate' | 'parallax' | 'custom';
  start: number;
  end: number;
  from: Record<string, any>;
  to: Record<string, any>;
  ease: string;
  markers: boolean;
}

export interface AnimationConfig {
  triggers: AnimationTrigger[];
  globalSettings: {
    scrub: number;
    pinSpacing: boolean;
  };
}

export interface ResponsiveConfig {
  desktop: Record<string, any>;
  tablet: Record<string, any>;
  mobile: Record<string, any>;
}

export interface PageStructure {
  elements: PageElement[];
  sections: {
    id: string;
    name: string;
    height: number;
    elementIds: string[];
  }[];
}

export interface Project {
  id: string;
  name: string;
  pageStructure: string;
  animationConfig: string;
  responsiveConfig: string;
  scrollCalibration: number;
  isAutoSave: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
