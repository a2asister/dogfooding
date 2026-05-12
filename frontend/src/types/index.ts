export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  position?: { x: number; y: number };
}

export interface ColorRelationship {
  type: 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
  color1: string;
  color2: string;
  strength: number;
}

export interface ColorPalette {
  colors: Color[];
  name: string;
  type: string;
  relationships?: ColorRelationship[];
}

export interface Palette {
  id: string;
  name: string;
  colors: string[];
  type?: string;
  emotion?: string;
  createdAt: string;
}

export type PaletteMode = 'image' | 'emotion' | 'complementary' | 'analogous' | 'triadic';
