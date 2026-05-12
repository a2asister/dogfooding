import { Injectable } from '@nestjs/common';
import * as chroma from 'chroma-js';

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  position?: { x: number; y: number };
}

export interface ColorPalette {
  colors: Color[];
  name: string;
  type: string;
}

export interface ColorRelationship {
  type: 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
  color1: string;
  color2: string;
  strength: number;
}

@Injectable()
export class ColorTheoryService {
  getComplementary(color: string): string {
    return chroma(color).set('hsl.h', (chroma(color).get('hsl.h') + 180) % 360).hex();
  }

  getAnalogous(color: string, count: number = 2): string[] {
    const baseHue = chroma(color).get('hsl.h');
    return Array.from({ length: count }, (_, i) => {
      const angle = (i - Math.floor(count / 2)) * 30;
      return chroma(color).set('hsl.h', (baseHue + angle + 360) % 360).hex();
    });
  }

  getTriadic(color: string): string[] {
    const baseHue = chroma(color).get('hsl.h');
    return [0, 120, 240].map(angle =>
      chroma(color).set('hsl.h', (baseHue + angle) % 360).hex()
    );
  }

  getSplitComplementary(color: string): string[] {
    const baseHue = chroma(color).get('hsl.h');
    return [0, 150, 210].map(angle =>
      chroma(color).set('hsl.h', (baseHue + angle) % 360).hex()
    );
  }

  generateEmotionalPalette(emotion: string): ColorPalette {
    const emotionPalettes: Record<string, string[]> = {
      happy: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
      calm: ['#A8D8EA', '#AA96DA', '#FCBAD3', '#E3FDFD', '#CBF1F5'],
      energetic: ['#FF4646', '#FF9F45', '#FCDE59', '#47B5FF', '#A855F7'],
      professional: ['#2C3E50', '#3498DB', '#ECF0F1', '#1ABC9C', '#E74C3C'],
      romantic: ['#FF6B9D', '#FFB6C1', '#FFD1DC', '#E6E6FA', '#FFF0F5'],
      nature: ['#2D5016', '#5B8C5A', '#8FB996', '#C3D9C5', '#E8F0E3'],
    };

    const colors = emotionPalettes[emotion] || emotionPalettes.happy;
    return {
      colors: colors.map(hex => this.colorToObject(hex)),
      name: `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Palette`,
      type: 'emotional',
    };
  }

  getColorRelationships(colors: string[]): ColorRelationship[] {
    const relationships: ColorRelationship[] = [];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const relationship = this.calculateRelationship(colors[i], colors[j]);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }

    return relationships;
  }

  private calculateRelationship(color1: string, color2: string): ColorRelationship | null {
    const hue1 = chroma(color1).get('hsl.h');
    const hue2 = chroma(color2).get('hsl.h');
    const hueDiff = Math.abs(hue1 - hue2);
    const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);

    if (normalizedDiff >= 170 && normalizedDiff <= 190) {
      return {
        type: 'complementary',
        color1,
        color2,
        strength: 1 - (Math.abs(normalizedDiff - 180) / 10),
      };
    }

    if (normalizedDiff >= 20 && normalizedDiff <= 40) {
      return {
        type: 'analogous',
        color1,
        color2,
        strength: 1 - (Math.abs(normalizedDiff - 30) / 10),
      };
    }

    return null;
  }

  colorToObject(hex: string, position?: { x: number; y: number }): Color {
    const rgb = chroma(hex).rgb();
    const hsl = chroma(hex).hsl();
    return {
      hex: hex.toUpperCase(),
      rgb: { r: Math.round(rgb[0]), g: Math.round(rgb[1]), b: Math.round(rgb[2]) },
      hsl: { h: Math.round(hsl[0]), s: Math.round(hsl[1] * 100), l: Math.round(hsl[2] * 100) },
      position,
    };
  }

  sortColorsByLuminance(colors: string[]): string[] {
    return [...colors].sort((a, b) => chroma(a).luminance() - chroma(b).luminance());
  }

  generateGradient(color1: string, color2: string, steps: number = 5): string[] {
    return chroma.scale([color1, color2]).mode('lch').colors(steps);
  }
}
