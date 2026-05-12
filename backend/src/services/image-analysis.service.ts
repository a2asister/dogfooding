import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { Color, ColorTheoryService } from './color-theory.service';

@Injectable()
export class ImageAnalysisService {
  constructor(private readonly colorTheoryService: ColorTheoryService) {}

  async extractColorsFromImage(
    imageBuffer: Buffer,
    colorCount: number = 5
  ): Promise<{ colors: Color[]; dominantColor: Color }> {
    const result = await sharp(imageBuffer)
      .resize(200, 200, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const data = result.data;
    const width = result.info.width;
    const height = result.info.height;

    const pixelColors: { r: number; g: number; b: number; x: number; y: number }[] = [];
    const colorCounts = new Map<string, { count: number; positions: { x: number; y: number }[] }>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const key = this.quantizeColor(r, g, b);
        const existing = colorCounts.get(key);

        if (existing) {
          existing.count++;
          existing.positions.push({ x: (x / width) * 100, y: (y / height) * 100 });
        } else {
          colorCounts.set(key, {
            count: 1,
            positions: [{ x: (x / width) * 100, y: (y / height) * 100 }],
          });
        }

        pixelColors.push({ r, g, b, x: (x / width) * 100, y: (y / height) * 100 });
      }
    }

    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, colorCount * 3);

    const finalColors = this.selectDiverseColors(sortedColors, colorCount);

    const colors = finalColors.map(({ key, positions }) => {
      const [r, g, b] = key.split(',').map(Number);
      const avgPosition = positions.length > 0
        ? {
            x: positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
            y: positions.reduce((sum, p) => sum + p.y, 0) / positions.length,
          }
        : { x: 50, y: 50 };

      return this.colorTheoryService.colorToObject(
        `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`,
        avgPosition
      );
    });

    return {
      colors,
      dominantColor: colors[0],
    };
  }

  private quantizeColor(r: number, g: number, b: number, steps: number = 32): string {
    const q = (val: number) => Math.round(val / steps) * steps;
    return `${q(r)},${q(g)},${q(b)}`;
  }

  private selectDiverseColors(
    sortedColors: [string, { count: number; positions: { x: number; y: number }[] }][],
    targetCount: number
  ): { key: string; positions: { x: number; y: number }[] }[] {
    const selected: { key: string; positions: { x: number; y: number }[] }[] = [];

    for (const [key, data] of sortedColors) {
      if (selected.length >= targetCount) break;

      const [r1, g1, b1] = key.split(',').map(Number);
      const isDiverse = selected.every(selectedColor => {
        const [r2, g2, b2] = selectedColor.key.split(',').map(Number);
        const distance = Math.sqrt(
          Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
        );
        return distance > 80;
      });

      if (isDiverse || selected.length === 0) {
        selected.push({ key, positions: data.positions });
      }
    }

    while (selected.length < targetCount && sortedColors[selected.length]) {
      const [key, data] = sortedColors[selected.length];
      selected.push({ key, positions: data.positions });
    }

    return selected;
  }

  async getColorStatistics(imageBuffer: Buffer): Promise<{
    brightness: number;
    saturation: number;
    warmth: number;
    contrast: number;
  }> {
    const { data, info } = await sharp(imageBuffer)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });

    let totalBrightness = 0;
    let totalSaturation = 0;
    let totalWarmth = 0;
    const pixelCount = info.width * info.height;

    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      totalBrightness += (r + g + b) / 3 / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      totalSaturation += max > 0 ? (max - min) / max : 0;
      totalWarmth += (r - b) / 255;
    }

    return {
      brightness: totalBrightness / pixelCount,
      saturation: totalSaturation / pixelCount,
      warmth: totalWarmth / pixelCount,
      contrast: 0.5,
    };
  }
}
