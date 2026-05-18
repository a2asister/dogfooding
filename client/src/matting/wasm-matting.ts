export interface MattingConfig {
  threshold: number;
  edgeSmoothing: number;
  edgeFeather: number;
}

export interface MattingProgress {
  stage: 'decoding' | 'segmentation' | 'alpha' | 'antialiasing' | 'encoding';
  percent: number;
}

interface Point {
  x: number;
  y: number;
}

interface LabColor {
  l: number;
  a: number;
  b: number;
}

export class WasmMattingEngine {
  private memory: Uint8ClampedArray | null = null;
  private width = 0;
  private height = 0;
  private labData: LabColor[] = [];

  public async processImage(
    imageData: ImageData,
    config: MattingConfig,
    onProgress?: (progress: MattingProgress) => void
  ): Promise<ImageData> {
    this.width = imageData.width;
    this.height = imageData.height;
    this.memory = new Uint8ClampedArray(imageData.data);

    if (onProgress) {
      onProgress({ stage: 'decoding', percent: 10 });
      await this.sleep(50);
    }

    this.precomputeLabColors();

    if (onProgress) {
      onProgress({ stage: 'segmentation', percent: 30 });
      await this.sleep(100);
    }
    const mask = this.semanticSegmentation(config);

    if (onProgress) {
      onProgress({ stage: 'segmentation', percent: 55 });
      await this.sleep(100);
    }
    const refinedMask = this.refineMask(mask);

    if (onProgress) {
      onProgress({ stage: 'alpha', percent: 70 });
      await this.sleep(100);
    }
    const alphaMap = this.calculateAlphaChannel(refinedMask, config);

    if (onProgress) {
      onProgress({ stage: 'antialiasing', percent: 85 });
      await this.sleep(100);
    }
    const smoothedAlpha = this.edgeAntialiasing(alphaMap, config);

    if (onProgress) {
      onProgress({ stage: 'encoding', percent: 95 });
    }

    const result = this.composeResult(smoothedAlpha);

    if (onProgress) {
      onProgress({ stage: 'encoding', percent: 100 });
    }

    return result;
  }

  private precomputeLabColors(): void {
    this.labData = new Array(this.width * this.height);
    const data = this.memory as Uint8ClampedArray;

    for (let i = 0; i < this.width * this.height; i++) {
      const idx = i * 4;
      const r = data[idx] / 255;
      const g = data[idx + 1] / 255;
      const b = data[idx + 2] / 255;

      let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

      x /= 0.95047;
      y /= 1.0;
      z /= 1.08883;

      const f = (t: number): number => {
        if (t > 0.008856) {
          return Math.cbrt(t);
        }
        return 7.787 * t + 16 / 116;
      };

      const fx = f(x);
      const fy = f(y);
      const fz = f(z);

      this.labData[i] = {
        l: 116 * fy - 16,
        a: 500 * (fx - fy),
        b: 200 * (fy - fz)
      };
    }
  }

  private colorDistance(c1: LabColor, c2: LabColor): number {
    const dl = c1.l - c2.l;
    const da = c1.a - c2.a;
    const db = c1.b - c2.b;
    return Math.sqrt(dl * dl + da * da + db * db);
  }

  private semanticSegmentation(config: MattingConfig): Uint8Array {
    const mask = new Uint8Array(this.width * this.height);

    const skinMask = this.detectSkinMask();
    const seedPoints = this.findSeedPoints(skinMask);

    const foregroundColors = this.sampleForegroundColors(seedPoints);
    const backgroundColor = this.estimateBackgroundColor();

    const regionMask = this.regionGrowing(seedPoints, foregroundColors, backgroundColor, config);

    let foregroundCount = 0;
    for (let i = 0; i < regionMask.length; i++) {
      if (regionMask[i]) {
        foregroundCount++;
      }
    }

    const ratio = foregroundCount / regionMask.length;
    if (ratio < 0.03 || ratio > 0.97) {
      return this.fallbackSegmentation(config);
    }

    for (let i = 0; i < mask.length; i++) {
      mask[i] = regionMask[i] ? 255 : 0;
    }

    return mask;
  }

  private detectSkinMask(): boolean[] {
    const skinMask = new Array<boolean>(this.width * this.height);
    const data = this.memory as Uint8ClampedArray;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const rgbSkin =
          r > 95 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          Math.abs(r - g) > 15 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 15;

        const ycrcb = this.rgbToYCrCb(r, g, b);
        const ycrcbSkin = ycrcb.cb >= 77 && ycrcb.cb <= 127 && ycrcb.cr >= 133 && ycrcb.cr <= 173;

        const hsv = this.rgbToHsv(r, g, b);
        const hsvSkin = hsv.h >= 0 && hsv.h <= 50 && hsv.s >= 0.23 && hsv.s <= 0.68;

        const isSkin = (rgbSkin ? 1 : 0) + (ycrcbSkin ? 1 : 0) + (hsvSkin ? 1 : 0) >= 2;
        skinMask[y * this.width + x] = isSkin;
      }
    }

    return skinMask;
  }

  private rgbToYCrCb(r: number, g: number, b: number): { y: number; cr: number; cb: number } {
    return {
      y: 0.299 * r + 0.587 * g + 0.114 * b,
      cr: 128 + 0.5 * r - 0.4187 * g - 0.0813 * b,
      cb: 128 - 0.1687 * r - 0.3313 * g + 0.5 * b
    };
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
      if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
      } else {
        h = ((r - g) / d + 4) / 6;
      }
    }

    return { h: h * 360, s, v };
  }

  private findSeedPoints(skinMask: boolean[]): Point[] {
    const seedPoints: Point[] = [];
    const visited = new Array<boolean>(this.width * this.height);

    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);

    const searchOrder: Point[] = [];
    const maxRadius = Math.max(this.width, this.height) / 2;

    for (let r = 0; r < maxRadius; r += 3) {
      for (let angle = 0; angle < 360; angle += 20) {
        const rad = (angle * Math.PI) / 180;
        const x = Math.floor(centerX + r * Math.cos(rad));
        const y = Math.floor(centerY + r * Math.sin(rad));
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          searchOrder.push({ x, y });
        }
      }
    }

    let largestSkinRegion: Point[] = [];
    for (const point of searchOrder) {
      const idx = point.y * this.width + point.x;
      if (skinMask[idx] && !visited[idx]) {
        const region = this.floodFill(point, skinMask, visited);
        if (region.length > largestSkinRegion.length) {
          largestSkinRegion = region;
        }
      }
    }

    if (largestSkinRegion.length > 50) {
      const center = this.findRegionCenter(largestSkinRegion);
      seedPoints.push(center);

      const additionalSeeds = this.samplePointsInRegion(largestSkinRegion, 3);
      seedPoints.push(...additionalSeeds);
    }

    if (seedPoints.length === 0) {
      for (let y = Math.floor(this.height * 0.25); y < this.height * 0.75; y += Math.floor(this.height * 0.1)) {
        for (let x = Math.floor(this.width * 0.25); x < this.width * 0.75; x += Math.floor(this.width * 0.1)) {
          seedPoints.push({ x, y });
          if (seedPoints.length >= 5) {
            break;
          }
        }
        if (seedPoints.length >= 5) {
          break;
        }
      }
    }

    if (seedPoints.length === 0) {
      seedPoints.push({ x: centerX, y: centerY });
    }

    return seedPoints;
  }

  private samplePointsInRegion(region: Point[], count: number): Point[] {
    const points: Point[] = [];
    const step = Math.max(1, Math.floor(region.length / count));

    for (let i = 0; i < region.length && points.length < count; i += step) {
      points.push(region[i]);
    }

    return points;
  }

  private floodFill(start: Point, mask: boolean[], visited: boolean[]): Point[] {
    const region: Point[] = [];
    const queue: Point[] = [start];
    visited[start.y * this.width + start.x] = true;

    while (queue.length > 0) {
      const p = queue.shift() as Point;
      region.push(p);

      const neighbors = [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
          const idx = n.y * this.width + n.x;
          if (mask[idx] && !visited[idx]) {
            visited[idx] = true;
            queue.push(n);
          }
        }
      }
    }

    return region;
  }

  private findRegionCenter(region: Point[]): Point {
    let sumX = 0;
    let sumY = 0;
    for (const p of region) {
      sumX += p.x;
      sumY += p.y;
    }
    return {
      x: Math.floor(sumX / region.length),
      y: Math.floor(sumY / region.length)
    };
  }

  private sampleForegroundColors(seedPoints: Point[]): LabColor[] {
    const colors: LabColor[] = [];
    const sampleRadius = 12;

    for (const seed of seedPoints) {
      for (let dy = -sampleRadius; dy <= sampleRadius; dy += 3) {
        for (let dx = -sampleRadius; dx <= sampleRadius; dx += 3) {
          const x = seed.x + dx;
          const y = seed.y + dy;
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const idx = y * this.width + x;
            colors.push(this.labData[idx]);
          }
        }
      }
    }

    return colors;
  }

  private estimateBackgroundColor(): LabColor {
    const borderColors: LabColor[] = [];

    const topBottomStep = Math.max(1, Math.floor(this.width / 20));
    for (let x = 0; x < this.width; x += topBottomStep) {
      borderColors.push(this.labData[x]);
      borderColors.push(this.labData[(this.height - 1) * this.width + x]);
    }

    const leftRightStep = Math.max(1, Math.floor(this.height / 20));
    for (let y = 0; y < this.height; y += leftRightStep) {
      borderColors.push(this.labData[y * this.width]);
      borderColors.push(this.labData[y * this.width + this.width - 1]);
    }

    let sumL = 0;
    let sumA = 0;
    let sumB = 0;
    for (const c of borderColors) {
      sumL += c.l;
      sumA += c.a;
      sumB += c.b;
    }

    return {
      l: sumL / borderColors.length,
      a: sumA / borderColors.length,
      b: sumB / borderColors.length
    };
  }

  private regionGrowing(
    seedPoints: Point[],
    foregroundColors: LabColor[],
    backgroundColor: LabColor,
    config: MattingConfig
  ): boolean[] {
    const regionMask = new Array<boolean>(this.width * this.height);
    const queue: Point[] = [];
    const minDist = new Float32Array(this.width * this.height);
    const INF = 1e6;

    for (let i = 0; i < minDist.length; i++) {
      minDist[i] = INF;
    }

    for (const seed of seedPoints) {
      const idx = seed.y * this.width + seed.x;
      regionMask[idx] = true;
      minDist[idx] = 0;
      queue.push(seed);
    }

    const baseThreshold = 30 + (1 - config.threshold) * 50;

    while (queue.length > 0) {
      const p = queue.shift() as Point;
      const currentDist = minDist[p.y * this.width + p.x];

      const neighbors = [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
          const nidx = n.y * this.width + n.x;
          if (!regionMask[nidx]) {
            const currentColor = this.labData[nidx];

            let minFgDist = Infinity;
            for (const fgColor of foregroundColors) {
              const dist = this.colorDistance(currentColor, fgColor);
              if (dist < minFgDist) {
                minFgDist = dist;
              }
            }

            const bgDist = this.colorDistance(currentColor, backgroundColor);

            const edgeStrength = this.calculateEdgeStrength(n.x, n.y);
            const fgThreshold = baseThreshold * (1 + edgeStrength * 0.3);
            const newDist = currentDist + 1;

            const fgCloser = minFgDist < bgDist * 0.95;
            const withinThreshold = minFgDist < fgThreshold;

            if (fgCloser && withinThreshold && newDist < minDist[nidx]) {
              regionMask[nidx] = true;
              minDist[nidx] = newDist;
              queue.push(n);
            }
          }
        }
      }
    }

    return regionMask;
  }

  private fallbackSegmentation(config: MattingConfig): Uint8Array {
    const mask = new Uint8Array(this.width * this.height);
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    const centerLab = this.labData[Math.floor(centerY) * this.width + Math.floor(centerX)];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const centerBias = 1 - dist / maxDist;

        const lab = this.labData[idx];
        const colorDistToCenter = this.colorDistance(lab, centerLab);
        const colorSim = 1 - Math.min(1, colorDistToCenter / 80);

        const score = centerBias * 0.6 + colorSim * 0.4;
        const adjustedThreshold = config.threshold * 0.7;

        mask[idx] = score > adjustedThreshold ? 255 : 0;
      }
    }

    return mask;
  }

  private calculateEdgeStrength(x: number, y: number): number {
    if (x <= 0 || x >= this.width - 1 || y <= 0 || y >= this.height - 1) {
      return 0;
    }

    const getColorDist = (x1: number, y1: number, x2: number, y2: number): number => {
      const c1 = this.labData[y1 * this.width + x1];
      const c2 = this.labData[y2 * this.width + x2];
      return this.colorDistance(c1, c2);
    };

    const gx =
      -1 * getColorDist(x - 1, y - 1, x, y) +
      -2 * getColorDist(x - 1, y, x, y) +
      -1 * getColorDist(x - 1, y + 1, x, y) +
      1 * getColorDist(x + 1, y - 1, x, y) +
      2 * getColorDist(x + 1, y, x, y) +
      1 * getColorDist(x + 1, y + 1, x, y);

    const gy =
      -1 * getColorDist(x - 1, y - 1, x, y) +
      -2 * getColorDist(x, y - 1, x, y) +
      -1 * getColorDist(x + 1, y - 1, x, y) +
      1 * getColorDist(x - 1, y + 1, x, y) +
      2 * getColorDist(x, y + 1, x, y) +
      1 * getColorDist(x + 1, y + 1, x, y);

    const magnitude = Math.sqrt(gx * gx + gy * gy);
    return Math.min(1, magnitude / 50);
  }

  private refineMask(mask: Uint8Array): Uint8Array {
    const refined = new Uint8Array(mask);

    for (let i = 0; i < 2; i++) {
      this.dilate(refined);
    }

    for (let i = 0; i < 1; i++) {
      this.erode(refined);
    }

    this.fillHoles(refined);
    this.removeSmallRegions(refined);

    return refined;
  }

  private dilate(mask: Uint8Array): void {
    const temp = new Uint8Array(mask);

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const idx = y * this.width + x;
        if (temp[idx] > 0) {
          continue;
        }

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = (y + dy) * this.width + (x + dx);
            if (temp[nidx] > 0) {
              mask[idx] = 255;
              break;
            }
          }
        }
      }
    }
  }

  private erode(mask: Uint8Array): void {
    const temp = new Uint8Array(mask);

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const idx = y * this.width + x;
        if (temp[idx] === 0) {
          continue;
        }

        let allForeground = true;
        for (let dy = -1; dy <= 1 && allForeground; dy++) {
          for (let dx = -1; dx <= 1 && allForeground; dx++) {
            const nidx = (y + dy) * this.width + (x + dx);
            if (temp[nidx] === 0) {
              allForeground = false;
            }
          }
        }

        if (!allForeground) {
          mask[idx] = 0;
        }
      }
    }
  }

  private fillHoles(mask: Uint8Array): void {
    const visited = new Array<boolean>(this.width * this.height);

    const queue: Point[] = [];

    for (let x = 0; x < this.width; x++) {
      if (mask[x] === 0) {
        queue.push({ x, y: 0 });
        visited[x] = true;
      }
      if (mask[(this.height - 1) * this.width + x] === 0) {
        queue.push({ x, y: this.height - 1 });
        visited[(this.height - 1) * this.width + x] = true;
      }
    }

    for (let y = 0; y < this.height; y++) {
      if (mask[y * this.width] === 0) {
        queue.push({ x: 0, y });
        visited[y * this.width] = true;
      }
      if (mask[y * this.width + this.width - 1] === 0) {
        queue.push({ x: this.width - 1, y });
        visited[y * this.width + this.width - 1] = true;
      }
    }

    while (queue.length > 0) {
      const p = queue.shift() as Point;

      const neighbors = [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
          const idx = n.y * this.width + n.x;
          if (mask[idx] === 0 && !visited[idx]) {
            visited[idx] = true;
            queue.push(n);
          }
        }
      }
    }

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0 && !visited[i]) {
        mask[i] = 255;
      }
    }
  }

  private removeSmallRegions(mask: Uint8Array): void {
    const visited = new Array<boolean>(this.width * this.height);
    const minSize = Math.max(200, this.width * this.height * 0.003);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        if (mask[idx] > 0 && !visited[idx]) {
          const region: Point[] = [];
          const queue: Point[] = [{ x, y }];
          visited[idx] = true;

          while (queue.length > 0) {
            const p = queue.shift() as Point;
            region.push(p);

            const neighbors = [
              { x: p.x + 1, y: p.y },
              { x: p.x - 1, y: p.y },
              { x: p.x, y: p.y + 1 },
              { x: p.x, y: p.y - 1 }
            ];

            for (const n of neighbors) {
              if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
                const nidx = n.y * this.width + n.x;
                if (mask[nidx] > 0 && !visited[nidx]) {
                  visited[nidx] = true;
                  queue.push(n);
                }
              }
            }
          }

          if (region.length < minSize) {
            for (const p of region) {
              mask[p.y * this.width + p.x] = 0;
            }
          }
        }
      }
    }
  }

  private calculateAlphaChannel(mask: Uint8Array, config: MattingConfig): Uint8Array {
    const alpha = new Uint8Array(this.width * this.height);
    const feather = Math.max(1, config.edgeFeather);

    const fgDist = this.distanceTransform(mask, true);
    const bgDist = this.distanceTransform(mask, false);

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] > 0) {
        const d = fgDist[i];
        if (d >= feather) {
          alpha[i] = 255;
        } else {
          alpha[i] = Math.round((d / feather) * 255);
        }
      } else {
        const d = bgDist[i];
        if (d >= feather) {
          alpha[i] = 0;
        } else {
          alpha[i] = Math.round((1 - d / feather) * 255);
        }
      }
    }

    return alpha;
  }

  private distanceTransform(mask: Uint8Array, foreground: boolean): Float32Array {
    const dist = new Float32Array(this.width * this.height);
    const INF = 1e6;

    for (let i = 0; i < dist.length; i++) {
      if (foreground) {
        dist[i] = mask[i] > 0 ? 0 : INF;
      } else {
        dist[i] = mask[i] === 0 ? 0 : INF;
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        if (x > 0) {
          dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1);
        }
        if (y > 0) {
          dist[idx] = Math.min(dist[idx], dist[idx - this.width] + 1);
        }
      }
    }

    for (let y = this.height - 1; y >= 0; y--) {
      for (let x = this.width - 1; x >= 0; x--) {
        const idx = y * this.width + x;
        if (x < this.width - 1) {
          dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1);
        }
        if (y < this.height - 1) {
          dist[idx] = Math.min(dist[idx], dist[idx + this.width] + 1);
        }
      }
    }

    return dist;
  }

  private edgeAntialiasing(alpha: Uint8Array, config: MattingConfig): Uint8Array {
    const result = new Uint8Array(alpha);
    const radius = Math.max(1, Math.round(config.edgeSmoothing * 2));

    const edgePixels: Point[] = [];
    for (let y = radius; y < this.height - radius; y++) {
      for (let x = radius; x < this.width - radius; x++) {
        const idx = y * this.width + x;
        if (alpha[idx] > 0 && alpha[idx] < 255) {
          edgePixels.push({ x, y });
        }
      }
    }

    for (const p of edgePixels) {
      const idx = p.y * this.width + p.x;

      let sum = 0;
      let weightSum = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = p.x + dx;
          const ny = p.y + dy;
          const nidx = ny * this.width + nx;

          const dist = Math.sqrt(dx * dx + dy * dy);
          const weight = Math.exp(-dist / (radius * 0.6));

          const edgeStrength = this.calculateEdgeStrength(nx, ny);
          const finalWeight = weight * (1 + edgeStrength * 0.5);

          sum += alpha[nidx] * finalWeight;
          weightSum += finalWeight;
        }
      }

      result[idx] = Math.round(sum / weightSum);
    }

    return result;
  }

  private composeResult(alpha: Uint8Array): ImageData {
    const data = this.memory as Uint8ClampedArray;
    const resultData = new Uint8ClampedArray(this.width * this.height * 4);

    for (let i = 0; i < alpha.length; i++) {
      const srcIdx = i * 4;
      const dstIdx = i * 4;

      resultData[dstIdx] = data[srcIdx];
      resultData[dstIdx + 1] = data[srcIdx + 1];
      resultData[dstIdx + 2] = data[srcIdx + 2];
      resultData[dstIdx + 3] = alpha[i];
    }

    return new ImageData(resultData, this.width, this.height);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mattingEngine = new WasmMattingEngine();
