import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import type { ModelParams, ProcessProgress } from './types';

declare global {
  namespace WebAssembly {
    class Memory {
      constructor(options: { initial: number; maximum?: number });
      readonly buffer: ArrayBuffer;
      grow(delta: number): number;
    }

    function instantiate(
      bufferSource: Buffer | Uint8Array,
      importObject?: Record<string, Record<string, unknown>>,
    ): Promise<{ instance: { exports: Record<string, unknown> } }>;
  }
}

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export type ProgressCallback = (progress: ProcessProgress) => void;

interface WasmModule {
  memory: WebAssembly.Memory;
  denoise: (
    inputPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    strength: number,
  ) => void;
  texture_restore: (
    inputPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    enhance: number,
  ) => void;
  colorize: (
    inputPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    intensity: number,
  ) => void;
  alloc: (size: number) => number;
  dealloc: (ptr: number, size: number) => void;
}

let wasmModule: WasmModule | null = null;

async function loadWasm(): Promise<WasmModule> {
  if (wasmModule) {
    return wasmModule;
  }

  const wasmPath = path.join(__dirname, '..', '..', 'wasm', 'pkg', 'photo_processor_bg.wasm');

  if (fs.existsSync(wasmPath)) {
    const wasmBuffer = fs.readFileSync(wasmPath);
    const wasm = await WebAssembly.instantiate(wasmBuffer, {
      env: {
        abort: (_msg: number, _file: number, _line: number, _col: number): void => {
          throw new Error('WASM abort');
        },
      },
    });
    wasmModule = wasm.instance.exports as unknown as WasmModule;
  } else {
    wasmModule = createFallbackWasm();
  }

  return wasmModule;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function getPixel(data: Uint8ClampedArray, width: number, x: number, y: number): [number, number, number, number] {
  const idx = (y * width + x) * 4;
  return [data[idx] ?? 0, data[idx + 1] ?? 0, data[idx + 2] ?? 0, data[idx + 3] ?? 255];
}

function quickSelect(arr: number[], k: number): number {
  if (arr.length === 1) {
    return arr[0] ?? 0;
  }
  const pivot = arr[Math.floor(arr.length / 2)] ?? 0;
  const left: number[] = [];
  const right: number[] = [];
  const equal: number[] = [];
  for (const v of arr) {
    if (v < pivot) {
      left.push(v);
    } else if (v > pivot) {
      right.push(v);
    } else {
      equal.push(v);
    }
  }
  if (k < left.length) {
    return quickSelect(left, k);
  } else if (k < left.length + equal.length) {
    return pivot;
  } else {
    return quickSelect(right, k - left.length - equal.length);
  }
}

function medianFilter(data: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const windowSize = (2 * radius + 1) * (2 * radius + 1);
  const midIndex = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const rVals: number[] = [];
      const gVals: number[] = [];
      const bVals: number[] = [];

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const [r, g, b] = getPixel(data, width, nx, ny);
          rVals.push(r);
          gVals.push(g);
          bVals.push(b);
        }
      }

      output[idx] = quickSelect(rVals, midIndex);
      output[idx + 1] = quickSelect(gVals, midIndex);
      output[idx + 2] = quickSelect(bVals, midIndex);
      output[idx + 3] = data[idx + 3] ?? 255;
    }
  }
  return output;
}

function gaussianBlur(data: Uint8ClampedArray, width: number, height: number, sigma: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const radius = Math.ceil(sigma * 3);
  const kernel: number[] = [];
  let sum = 0;

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const val = Math.exp(-(i * i + j * j) / (2 * sigma * sigma));
      kernel.push(val);
      sum += val;
    }
  }

  for (let i = 0; i < kernel.length; i++) {
    kernel[i] = (kernel[i] as number) / sum;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
      let ki = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const [pr, pg, pb] = getPixel(data, width, nx, ny);
          const k = kernel[ki] ?? 0;
          r += pr * k;
          g += pg * k;
          b += pb * k;
          ki++;
        }
      }

      output[idx] = clamp(r);
      output[idx + 1] = clamp(g);
      output[idx + 2] = clamp(b);
      output[idx + 3] = data[idx + 3] ?? 255;
    }
  }
  return output;
}

function unsharpMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number,
  sigma: number,
): Uint8ClampedArray {
  const blurred = gaussianBlur(data, width, height, sigma);
  const output = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = data[i + c] ?? 0;
      const blur = blurred[i + c] ?? 0;
      const highFreq = original - blur;
      output[i + c] = clamp(original + highFreq * amount);
    }
    output[i + 3] = data[i + 3] ?? 255;
  }
  return output;
}

function sobelEdge(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  if (x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1) {
    return 0;
  }

  const getGray = (dx: number, dy: number): number => {
    const [r, g, b] = getPixel(data, width, x + dx, y + dy);
    return r * 0.299 + g * 0.587 + b * 0.114;
  };

  const gx = -getGray(-1, -1) - 2 * getGray(-1, 0) - getGray(-1, 1)
    + getGray(1, -1) + 2 * getGray(1, 0) + getGray(1, 1);

  const gy = -getGray(-1, -1) - 2 * getGray(0, -1) - getGray(1, -1)
    + getGray(-1, 1) + 2 * getGray(0, 1) + getGray(1, 1);

  return Math.min(1, Math.sqrt(gx * gx + gy * gy) / 255);
}

function analyzeImageContent(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): {
  hasSky: boolean;
  hasGround: boolean;
  hasFoliage: boolean;
  skyLineY: number;
  groundLineY: number;
  dominantRegions: Map<string, number>;
  averageBrightness: number;
} {
  const grayImage = new Float32Array(width * height);
  let totalGray = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(data, width, x, y);
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      grayImage[y * width + x] = gray;
      totalGray += gray;
    }
  }

  const rowAvg = new Float32Array(height);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      sum += grayImage[y * width + x] ?? 0;
    }
    rowAvg[y] = sum / width;
  }

  let maxGradient = 0;
  let skyLineY = height * 0.3;
  for (let y = 1; y < height - 1; y++) {
    const gradient = (rowAvg[y - 1] ?? 0) - (rowAvg[y + 1] ?? 0);
    if (gradient > maxGradient && y < height * 0.5) {
      maxGradient = gradient;
      skyLineY = y;
    }
  }

  let minGradient = 0;
  let groundLineY = height * 0.7;
  for (let y = height - 2; y > 1; y--) {
    const gradient = (rowAvg[y - 1] ?? 0) - (rowAvg[y + 1] ?? 0);
    if (gradient < minGradient && y > height * 0.5) {
      minGradient = gradient;
      groundLineY = y;
    }
  }

  let skyBrightness = 0;
  let skyPixels = 0;
  for (let y = 0; y < skyLineY; y++) {
    for (let x = 0; x < width; x++) {
      skyBrightness += grayImage[y * width + x] ?? 0;
      skyPixels++;
    }
  }
  const avgSky = skyPixels > 0 ? skyBrightness / skyPixels : 128;

  let groundDarkness = 0;
  let groundPixels = 0;
  for (let y = groundLineY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      groundDarkness += 255 - (grayImage[y * width + x] ?? 0);
      groundPixels++;
    }
  }
  const avgGroundDarkness = groundPixels > 0 ? groundDarkness / groundPixels : 0;

  let hasSky = false;
  let hasGround = false;
  let hasFoliage = false;

  if (avgSky > 140 && skyLineY < height * 0.4) {
    hasSky = true;
  }

  if (avgGroundDarkness > 80 && groundLineY > height * 0.6) {
    hasGround = true;
  }

  if (hasSky && hasGround) {
    hasFoliage = true;
  }

  const dominantRegions = new Map<string, number>();
  if (hasSky) {
    dominantRegions.set('sky', skyLineY / height);
  }
  if (hasGround) {
    dominantRegions.set('ground', (height - groundLineY) / height);
  }
  if (hasFoliage) {
    dominantRegions.set('foliage', (groundLineY - skyLineY) / height);
  }

  return {
    hasSky,
    hasGround,
    hasFoliage,
    skyLineY,
    groundLineY,
    dominantRegions,
    averageBrightness: totalGray / (width * height),
  };
}

function regionGrowSegmentation(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
): Int32Array {
  const labels = new Int32Array(width * height).fill(-1);
  let currentLabel = 0;
  const grayThreshold = threshold;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (labels[idx] === -1) {
        const [sr, sg, sb] = getPixel(data, width, x, y);
        const seedGray = sr * 0.299 + sg * 0.587 + sb * 0.114;

        const queue: Array<[number, number]> = [[x, y]];
        labels[idx] = currentLabel;

        while (queue.length > 0) {
          const [cx, cy] = queue.pop() as [number, number];

          const neighbors: Array<[number, number]> = [
            [cx + 1, cy], [cx - 1, cy],
            [cx, cy + 1], [cx, cy - 1],
            [cx + 1, cy + 1], [cx - 1, cy - 1],
            [cx + 1, cy - 1], [cx - 1, cy + 1],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (labels[nidx] === -1) {
                const [nr, ng, nb] = getPixel(data, width, nx, ny);
                const neighborGray = nr * 0.299 + ng * 0.587 + nb * 0.114;

                if (Math.abs(neighborGray - seedGray) < grayThreshold) {
                  labels[nidx] = currentLabel;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }

        currentLabel++;
      }
    }
  }

  return labels;
}

function getRegionColor(
  gray: number,
  regionGray: number,
  regionSize: number,
  imageSize: number,
  analysis: ReturnType<typeof analyzeImageContent>,
  x: number,
  y: number,
  width: number,
  height: number,
): { r: number; g: number; b: number } {
  const nx = x / width;
  const ny = y / height;

  const regionRatio = regionSize / imageSize;
  const grayDiff = Math.abs(gray - regionGray);

  const skyColor = { r: 135, g: 206, b: 235 };
  const deepSkyColor = { r: 100, g: 149, b: 237 };
  const cloudColor = { r: 245, g: 250, b: 255 };

  const grassColor = { r: 34, g: 139, b: 34 };
  const darkGrassColor = { r: 85, g: 107, b: 47 };
  const lightGrassColor = { r: 144, g: 238, b: 144 };

  const dirtColor = { r: 139, g: 90, b: 43 };
  const darkDirtColor = { r: 101, g: 67, b: 33 };
  const lightDirtColor = { r: 210, g: 180, b: 140 };

  const skinColor = { r: 255, g: 218, b: 185 };
  const lightSkinColor = { r: 255, g: 239, b: 213 };

  const treeColor = { r: 34, g: 139, b: 34 };
  const darkTreeColor = { r: 0, g: 100, b: 0 };

  const buildingColor = { r: 169, g: 169, b: 169 };

  if (analysis.hasSky && ny < analysis.skyLineY / height + 0.05) {
    if (gray > 200) {
      return cloudColor;
    } else if (gray > 160) {
      return skyColor;
    } else {
      return deepSkyColor;
    }
  }

  if (analysis.hasGround && ny > analysis.groundLineY / height - 0.05) {
    if (gray > 180) {
      return lightDirtColor;
    } else if (gray > 120) {
      return dirtColor;
    } else {
      return darkDirtColor;
    }
  }

  if (analysis.hasFoliage && ny > analysis.skyLineY / height && ny < analysis.groundLineY / height) {
    if (regionRatio > 0.05) {
      if (gray > 150) {
        return lightGrassColor;
      } else if (gray > 100) {
        return grassColor;
      } else {
        return darkGrassColor;
      }
    }
  }

  if (regionRatio > 0.02 && regionRatio < 0.3) {
    if (gray > 180 && gray < 230 && grayDiff < 20) {
      if (nx > 0.2 && nx < 0.8 && ny > 0.2 && ny < 0.8) {
        if (gray > 200) {
          return lightSkinColor;
        } else {
          return skinColor;
        }
      }
    }

    if (gray < 80 && grayDiff < 30) {
      if (ny < 0.6) {
        return darkTreeColor;
      } else {
        return darkDirtColor;
      }
    }

    if (gray > 100 && gray < 180 && grayDiff < 25) {
      if (nx < 0.3 || nx > 0.7) {
        return buildingColor;
      }
    }
  }

  if (regionRatio < 0.01) {
    if (gray > 200) {
      return { r: 255, g: 250, b: 240 };
    } else if (gray < 50) {
      return { r: 50, g: 50, b: 50 };
    }
  }

  if (gray > 220) {
    return { r: 255, g: 253, b: 245 };
  } else if (gray > 180) {
    return { r: 245, g: 235, b: 220 };
  } else if (gray > 140) {
    if (nx < 0.5) {
      return lightGrassColor;
    } else {
      return lightDirtColor;
    }
  } else if (gray > 100) {
    if (ny < 0.5) {
      return treeColor;
    } else {
      return dirtColor;
    }
  } else if (gray > 60) {
    if (nx < 0.5) {
      return darkTreeColor;
    } else {
      return darkDirtColor;
    }
  } else {
    return { r: 60, g: 50, b: 40 };
  }
}

function smoothColors(
  colors: Array<{ r: number; g: number; b: number }>,
  width: number,
  height: number,
  sigma: number,
): Array<{ r: number; g: number; b: number }> {
  const radius = Math.ceil(sigma * 2);
  const smoothed = new Array<{ r: number; g: number; b: number }>(colors.length);
  const kernel: number[] = [];
  let kernelSum = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const val = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      kernel.push(val);
      kernelSum += val;
    }
  }

  for (let i = 0; i < kernel.length; i++) {
    kernel[i] = (kernel[i] as number) / kernelSum;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let r = 0, g = 0, b = 0;
      let ki = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nidx = ny * width + nx;
          const color = colors[nidx];
          if (color) {
            const k = kernel[ki] ?? 0;
            r += color.r * k;
            g += color.g * k;
            b += color.b * k;
          }
          ki++;
        }
      }

      smoothed[idx] = { r: clamp(r), g: clamp(g), b: clamp(b) };
    }
  }

  return smoothed;
}

function createFallbackWasm(): WasmModule {
  const memory = new WebAssembly.Memory({ initial: 256 });
  return {
    memory,
    alloc: (size: number): number => {
      const view = new Uint8Array(memory.buffer);
      const ptr = view.length;
      memory.grow(Math.ceil(size / 65536));
      return ptr;
    },
    dealloc: (): void => {
      // no-op for fallback
    },
    denoise: (inputPtr: number, outputPtr: number, width: number, height: number, strength: number): void => {
      const input = new Uint8ClampedArray(memory.buffer, inputPtr, width * height * 4);
      const output = new Uint8ClampedArray(memory.buffer, outputPtr, width * height * 4);

      const radius = Math.max(1, Math.floor(strength * 2));
      const filtered = medianFilter(input, width, height, radius);
      output.set(filtered);
    },
    texture_restore: (inputPtr: number, outputPtr: number, width: number, height: number, enhance: number): void => {
      const input = new Uint8ClampedArray(memory.buffer, inputPtr, width * height * 4);
      const output = new Uint8ClampedArray(memory.buffer, outputPtr, width * height * 4);

      const amount = 0.5 + enhance * 1.5;
      const sigma = 0.8 + enhance * 0.5;
      const sharpened = unsharpMask(input, width, height, amount, sigma);
      output.set(sharpened);
    },
    colorize: (inputPtr: number, outputPtr: number, width: number, height: number, intensity: number): void => {
      const input = new Uint8ClampedArray(memory.buffer, inputPtr, width * height * 4);
      const output = new Uint8ClampedArray(memory.buffer, outputPtr, width * height * 4);
      const imageSize = width * height;

      const analysis = analyzeImageContent(input, width, height);
      const labels = regionGrowSegmentation(input, width, height, 25);

      const regionInfo = new Map<number, { graySum: number; count: number; minGray: number; maxGray: number }>();

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i] ?? -1;
        if (label >= 0) {
          const idx = i * 4;
          const gray = (input[idx] ?? 0) * 0.299 + (input[idx + 1] ?? 0) * 0.587 + (input[idx + 2] ?? 0) * 0.114;

          const info = regionInfo.get(label);
          if (info) {
            info.graySum += gray;
            info.count++;
            info.minGray = Math.min(info.minGray, gray);
            info.maxGray = Math.max(info.maxGray, gray);
          } else {
            regionInfo.set(label, { graySum: gray, count: 1, minGray: gray, maxGray: gray });
          }
        }
      }

      const regionAvgGray = new Map<number, number>();
      for (const [label, info] of regionInfo) {
        regionAvgGray.set(label, info.graySum / Math.max(1, info.count));
      }

      const rawColors = new Array<{ r: number; g: number; b: number }>(imageSize);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const pixelIdx = idx * 4;
          const r = input[pixelIdx] ?? 0;
          const g = input[pixelIdx + 1] ?? 0;
          const b = input[pixelIdx + 2] ?? 0;
          const gray = r * 0.299 + g * 0.587 + b * 0.114;

          const label = labels[idx] ?? -1;
          const regionSize = regionInfo.get(label)?.count ?? 1;
          const regionGray = regionAvgGray.get(label) ?? gray;

          rawColors[idx] = getRegionColor(gray, regionGray, regionSize, imageSize, analysis, x, y, width, height);
        }
      }

      const smoothedColors = smoothColors(rawColors, width, height, 1.5);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const pixelIdx = idx * 4;
          const r = input[pixelIdx] ?? 0;
          const g = input[pixelIdx + 1] ?? 0;
          const b = input[pixelIdx + 2] ?? 0;
          const a = input[pixelIdx + 3] ?? 255;

          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          const color = smoothedColors[idx];

          if (color) {
            const edge = sobelEdge(input, width, height, x, y);
            const edgeBoost = 1 + edge * 0.3;

            const finalR = clamp(color.r * edgeBoost);
            const finalG = clamp(color.g * edgeBoost);
            const finalB = clamp(color.b * edgeBoost);

            output[pixelIdx] = clamp(gray * (1 - intensity) + finalR * intensity);
            output[pixelIdx + 1] = clamp(gray * (1 - intensity) + finalG * intensity);
            output[pixelIdx + 2] = clamp(gray * (1 - intensity) + finalB * intensity);
          } else {
            output[pixelIdx] = clamp(gray);
            output[pixelIdx + 1] = clamp(gray);
            output[pixelIdx + 2] = clamp(gray);
          }
          output[pixelIdx + 3] = a;
        }
      }
    },
  };
}

export async function processImage(
  taskId: string,
  inputPath: string,
  params: ModelParams,
  onProgress: ProgressCallback,
): Promise<string> {
  const wasm = await loadWasm();

  onProgress({
    taskId,
    stage: 'preprocess',
    progress: 10,
    message: '正在加载图片...',
  });

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  const { data, info } = await image
    .resize(Math.min(width, 1600), Math.min(height, 1600), { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const imageData = new Uint8ClampedArray(data);
  const newWidth = info.width;
  const newHeight = info.height;
  const pixelCount = newWidth * newHeight;
  const bufferSize = pixelCount * 4;

  const inputPtr = wasm.alloc(bufferSize);
  const outputPtr = wasm.alloc(bufferSize);

  const inputView = new Uint8ClampedArray(wasm.memory.buffer, inputPtr, bufferSize);
  inputView.set(imageData);

  await sendProgressFrame(taskId, 'preprocess', 20, '预处理完成', wasm, outputPtr, newWidth, newHeight, onProgress);

  onProgress({
    taskId,
    stage: 'denoise',
    progress: 30,
    message: '正在进行去噪处理...',
  });

  wasm.denoise(inputPtr, outputPtr, newWidth, newHeight, params.denoiseStrength);

  const denoisedView = new Uint8ClampedArray(wasm.memory.buffer, outputPtr, bufferSize);
  inputView.set(denoisedView);

  await sendProgressFrame(taskId, 'denoise', 45, '去噪完成', wasm, outputPtr, newWidth, newHeight, onProgress);

  onProgress({
    taskId,
    stage: 'texture',
    progress: 55,
    message: '正在修复纹理...',
  });

  wasm.texture_restore(inputPtr, outputPtr, newWidth, newHeight, params.textureEnhance);

  const textureView = new Uint8ClampedArray(wasm.memory.buffer, outputPtr, bufferSize);
  inputView.set(textureView);

  await sendProgressFrame(taskId, 'texture', 70, '纹理修复完成', wasm, inputPtr, newWidth, newHeight, onProgress);

  onProgress({
    taskId,
    stage: 'colorize',
    progress: 80,
    message: '正在智能上色...',
  });

  wasm.colorize(inputPtr, outputPtr, newWidth, newHeight, params.colorIntensity);

  await sendProgressFrame(taskId, 'colorize', 90, '上色完成', wasm, outputPtr, newWidth, newHeight, onProgress);

  onProgress({
    taskId,
    stage: 'postprocess',
    progress: 95,
    message: '正在进行后期处理...',
  });

  const outputView = new Uint8ClampedArray(wasm.memory.buffer, outputPtr, bufferSize);
  const finalBuffer = Buffer.from(outputView);

  const outputFileName = `${taskId}_processed.jpg`;
  const outputPath = path.join(UPLOAD_DIR, outputFileName);

  let pipeline = sharp(finalBuffer, {
    raw: { width: newWidth, height: newHeight, channels: 4 },
  })
    .sharpen(0.5 + params.sharpenLevel * 1.0, 0.5, 1.0)
    .modulate({
      brightness: 1 + params.brightness * 0.2,
      saturation: 1.1 + params.colorIntensity * 0.3,
    });

  if (Math.abs(params.contrast) > 0.01) {
    pipeline = pipeline.linear(1 + params.contrast * 0.3, -(128 * params.contrast * 0.3));
  }

  await pipeline.jpeg({ quality: 95, progressive: true }).toFile(outputPath);

  wasm.dealloc(inputPtr, bufferSize);
  wasm.dealloc(outputPtr, bufferSize);

  onProgress({
    taskId,
    stage: 'postprocess',
    progress: 100,
    message: '处理完成!',
  });

  return outputPath;
}

async function sendProgressFrame(
  taskId: string,
  stage: ProcessProgress['stage'],
  progress: number,
  message: string,
  wasm: WasmModule,
  ptr: number,
  width: number,
  height: number,
  onProgress: ProgressCallback,
): Promise<void> {
  try {
    const view = new Uint8ClampedArray(wasm.memory.buffer, ptr, width * height * 4);
    const frameBuffer = Buffer.from(view);
    const thumbnail = await sharp(frameBuffer, {
      raw: { width, height, channels: 4 },
    })
      .resize(300, null, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();
    const frameData = `data:image/jpeg;base64,${thumbnail.toString('base64')}`;
    onProgress({ taskId, stage, progress, message, frameData });
  } catch {
    onProgress({ taskId, stage, progress, message });
  }
}

export function getFilePath(fileName: string): string {
  return path.join(UPLOAD_DIR, fileName);
}
