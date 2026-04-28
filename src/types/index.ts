export type ElementType = 
  | 'title' 
  | 'list' 
  | 'bold' 
  | 'italic' 
  | 'link' 
  | 'divider' 
  | 'rectangle' 
  | 'slide';

export type AnimationType = 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'scaleIn' | 'none';

export interface BorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
}

export interface ElementStyle {
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  backgroundImage: string;
  opacity: number;
  rotation: number;
  border: BorderStyle;
  borderRadius: number;
  animation: AnimationType;
  animationDuration: number;
  animationDelay: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  content: string;
  style: ElementStyle;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  scale: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface EditorState {
  elements: CanvasElement[];
  selectedElementIds: string[];
  canvas: CanvasState;
  isPreviewMode: boolean;
}

export type DragItem = {
  type: ElementType;
  isNew: boolean;
  elementId?: string;
};

export const DEFAULT_STYLE: ElementStyle = {
  width: 200,
  height: 50,
  x: 0,
  y: 0,
  color: '#333333',
  backgroundColor: 'transparent',
  backgroundImage: '',
  opacity: 1,
  rotation: 0,
  border: {
    width: 0,
    style: 'none',
    color: '#000000'
  },
  borderRadius: 0,
  animation: 'none',
  animationDuration: 0.5,
  animationDelay: 0
};

export const ELEMENT_DEFAULTS: Record<ElementType, Partial<ElementStyle> & { defaultContent: string }> = {
  title: {
    width: 300,
    height: 40,
    defaultContent: '标题文本'
  },
  list: {
    width: 300,
    height: 80,
    defaultContent: '• 列表项 1\n• 列表项 2\n• 列表项 3'
  },
  bold: {
    width: 200,
    height: 30,
    defaultContent: '粗体文本'
  },
  italic: {
    width: 200,
    height: 30,
    defaultContent: '斜体文本'
  },
  link: {
    width: 200,
    height: 30,
    defaultContent: '链接文本',
    color: '#0066cc'
  },
  divider: {
    width: 300,
    height: 2,
    backgroundColor: '#cccccc',
    defaultContent: ''
  },
  rectangle: {
    width: 200,
    height: 120,
    backgroundColor: '#e0e0e0',
    defaultContent: ''
  },
  slide: {
    width: 400,
    height: 250,
    backgroundColor: '#f5f5f5',
    defaultContent: ''
  }
};
