export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  hasMask: boolean;
  maskEnabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Selection {
  type: 'rect' | 'circle' | 'lasso' | 'magic';
  path?: { x: number; y: number }[];
  bounds?: { x: number; y: number; width: number; height: number };
  center?: { x: number; y: number };
  radius?: number;
  feather: number;
  colorThreshold?: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  resolution: number;
  backgroundColor: string;
}

export interface Tool {
  type: 'select' | 'move' | 'brush' | 'eraser' | 'rectSelect' | 'circleSelect' | 'lasso' | 'magicWand' | 'maskBrush';
  size: number;
  hardness: number;
  color: string;
  opacity: number;
}

export interface EditorState {
  canvasConfig: CanvasConfig;
  layers: Layer[];
  activeLayerId: string | null;
  selection: Selection | null;
  currentTool: Tool;
  zoom: number;
  panX: number;
  panY: number;
  lastSaved: number | null;
}