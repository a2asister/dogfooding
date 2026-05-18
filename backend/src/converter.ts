import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { AudioFormat, QualityPreset, ConversionOptions, ConversionWorkerResult } from './types.js';
import { convertAudioSync } from './converter.logic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist');
const isDev = __filename.includes(path.join('backend', 'src'));

const qualitySettings: Record<QualityPreset, Record<AudioFormat, { sampleRate: number; bitDepth?: number; bitRate?: number }>> = {
  low: {
    flac: { sampleRate: 44100, bitDepth: 16 },
    wav: { sampleRate: 44100, bitDepth: 16 },
    mp3: { sampleRate: 44100, bitRate: 128000 }
  },
  medium: {
    flac: { sampleRate: 48000, bitDepth: 16 },
    wav: { sampleRate: 48000, bitDepth: 16 },
    mp3: { sampleRate: 48000, bitRate: 256000 }
  },
  high: {
    flac: { sampleRate: 96000, bitDepth: 24 },
    wav: { sampleRate: 96000, bitDepth: 24 },
    mp3: { sampleRate: 48000, bitRate: 320000 }
  },
  lossless: {
    flac: { sampleRate: 192000, bitDepth: 24 },
    wav: { sampleRate: 192000, bitDepth: 24 },
    mp3: { sampleRate: 48000, bitRate: 320000 }
  }
};

export function getQualitySettings(quality: QualityPreset, format: AudioFormat) {
  return qualitySettings[quality][format];
}

export async function convertAudio(
  inputPath: string,
  outputPath: string,
  options: ConversionOptions
): Promise<ConversionWorkerResult> {
  if (isDev) {
    return convertAudioSync(inputPath, outputPath, options);
  }

  return new Promise((resolve) => {
    const worker = new Worker(path.join(__dirname, 'converter.worker.js'), {
      workerData: {
        inputPath,
        outputPath,
        options
      }
    });

    worker.on('message', (result: ConversionWorkerResult) => {
      resolve(result);
    });

    worker.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Worker exited with code ${code}`
        });
      }
    });
  });
}

export function detectFormat(filename: string): AudioFormat | null {
  const ext = path.extname(filename).toLowerCase().slice(1);
  if (ext === 'flac' || ext === 'wav' || ext === 'mp3') {
    return ext as AudioFormat;
  }
  return null;
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
