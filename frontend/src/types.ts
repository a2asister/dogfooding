export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type ComparisonMode = 'idle' | 'adding' | 'comparing';

export interface DragState {
  isDragging: boolean;
  draggedProductId: string | null;
  isOverComparison: boolean;
}
