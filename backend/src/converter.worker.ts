import { parentPort, workerData } from 'node:worker_threads';
import type { ConversionWorkerData, ConversionWorkerResult } from './types.js';
import { convertAudioSync } from './converter.logic.js';

const data = workerData as ConversionWorkerData;

const result: ConversionWorkerResult = convertAudioSync(
  data.inputPath,
  data.outputPath,
  data.options
);

parentPort?.postMessage(result);
