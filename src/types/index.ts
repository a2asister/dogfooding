export interface ComponentStyle {
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  margin?: string | number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  borderRadius?: string | number;
  border?: string;
  boxShadow?: string;
  textAlign?: 'left' | 'center' | 'right';
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  zIndex?: number;
}

export interface ComponentProps {
  text?: string;
  imageUrl?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | number;
  onClick?: () => void;
  onChange?: (value: string) => void;
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  name: string;
  style: ComponentStyle;
  props: ComponentProps;
  parentId?: string;
  children?: string[];
  locked?: boolean;
  visible?: boolean;
}

export enum ComponentType {
  TEXT = 'text',
  BUTTON = 'button',
  IMAGE = 'image',
  INPUT = 'input',
  SELECT = 'select',
  CONTAINER = 'container',
  ROW = 'row',
  COL = 'col',
  DIVIDER = 'divider',
  TABLE = 'table',
  CARD = 'card',
  MODAL = 'modal',
  TABS = 'tabs',
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: ComponentTemplate[];
}

export interface ComponentTemplate {
  type: ComponentType;
  name: string;
  icon: string;
  defaultStyle: ComponentStyle;
  defaultProps: ComponentProps;
  description?: string;
}

export interface EditorState {
  canvasComponents: CanvasComponent[];
  selectedComponentId: string | null;
  clipboardComponents: CanvasComponent[];
  history: CanvasComponent[][];
  historyIndex: number;
  currentDevice: DeviceType;
  layoutMode: LayoutMode;
  zoom: number;
  isPreviewMode: boolean;
}

export enum DeviceType {
  PC = 'pc',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  MINI_PROGRAM = 'mini_program',
}

export enum LayoutMode {
  FREE = 'free',
  GRID = 'grid',
}

export interface DeviceConfig {
  type: DeviceType;
  name: string;
  width: number;
  height: number;
  icon: string;
}

export interface InteractionConfig {
  type: InteractionType;
  trigger: InteractionTrigger;
  targetId?: string;
  actionConfig?: Record<string, unknown>;
}

export enum InteractionType {
  CLICK = 'click',
  HOVER = 'hover',
  CHANGE = 'change',
  LOAD = 'load',
}

export enum InteractionTrigger {
  SHOW = 'show',
  HIDE = 'hide',
  TOGGLE = 'toggle',
  NAVIGATE = 'navigate',
  REFRESH = 'refresh',
  OPEN_MODAL = 'open_modal',
  CLOSE_MODAL = 'close_modal',
}
