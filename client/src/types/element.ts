export interface Element {
  id: number;
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass?: number;
  category?: string;
  group?: number;
  period?: number;
  electronConfiguration?: string;
  electronegativity?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  description?: string;
  color?: string;
}

export interface Favorite {
  id: number;
  userId: string;
  elementId: number;
  element: Element;
  createdAt: string;
}

export interface Note {
  id: number;
  userId: string;
  content: string;
  elementId?: number;
  element?: Element;
  categoryId?: number;
  category?: KnowledgeCategory;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  notes?: Note[];
}
