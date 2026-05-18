import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import {
  insertAudioFile,
  getAudioFile,
  insertConversionTask,
  updateTaskStatus,
  getTask,
  getTasksByFileId,
  insertBatchJob,
  updateBatchJob,
  getBatchJob,
  rowToAudioFile,
  rowToConversionTask,
  rowToBatchJob
} from '../db.js';
import { convertAudio, detectFormat, ensureDir, getQualitySettings } from '../converter.js';
import type { ConversionOptions, AudioFormat, QualityPreset } from '../types.js';

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
const CONVERTED_DIR = path.resolve(process.cwd(), 'converted');
const ARCHIVE_DIR = path.resolve(process.cwd(), 'archives');

ensureDir(UPLOAD_DIR);
ensureDir(CONVERTED_DIR);
ensureDir(ARCHIVE_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.flac' || ext === '.wav' || ext === '.mp3') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'));
    }
  }
});

router.post('/upload', upload.array('files', 50), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const uploadedFiles = files.map((file) => {
      const format = detectFormat(file.originalname);
      const fileId = uuidv4();

      const audioFile = {
        id: fileId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        originalFormat: format as AudioFormat,
        createdAt: Date.now()
      };

      insertAudioFile.run(audioFile);

      return audioFile;
    });

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { fileIds, targetFormat, quality } = req.body as {
      fileIds: string[];
      targetFormat: AudioFormat;
      quality: QualityPreset;
    };

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      res.status(400).json({ error: 'No file IDs provided' });
      return;
    }

    if (!targetFormat || !['flac', 'wav', 'mp3'].includes(targetFormat)) {
      res.status(400).json({ error: 'Invalid target format' });
      return;
    }

    if (!quality || !['low', 'medium', 'high', 'lossless'].includes(quality)) {
      res.status(400).json({ error: 'Invalid quality preset' });
      return;
    }

    const taskIds: string[] = [];

    for (const fileId of fileIds) {
      const fileRow = getAudioFile.get(fileId);
      const audioFile = rowToAudioFile(fileRow);

      if (!audioFile) {
        continue;
      }

      const taskId = uuidv4();
      const settings = getQualitySettings(quality, targetFormat);

      const options: ConversionOptions = {
        targetFormat,
        quality,
        sampleRate: settings.sampleRate,
        bitDepth: settings.bitDepth,
        bitRate: settings.bitRate
      };

      const task = {
        id: taskId,
        fileId,
        targetFormat,
        quality,
        sampleRate: settings.sampleRate ?? null,
        bitDepth: settings.bitDepth ?? null,
        bitRate: settings.bitRate ?? null,
        status: 'pending' as const,
        progress: 0,
        createdAt: Date.now()
      };

      insertConversionTask.run(task);
      taskIds.push(taskId);

      setImmediate(async () => {
        try {
          updateTaskStatus.run({
            id: taskId,
            status: 'processing',
            progress: 10,
            outputPath: null,
            outputSize: null,
            error: null,
            completedAt: null
          });

          const outputFileName = `${path.basename(audioFile.fileName, path.extname(audioFile.fileName))}.${targetFormat}`;
          const outputPath = path.join(CONVERTED_DIR, outputFileName);

          const result = await convertAudio(audioFile.filePath, outputPath, options);

          if (result.success && result.outputPath) {
            updateTaskStatus.run({
              id: taskId,
              status: 'completed',
              progress: 100,
              outputPath: result.outputPath,
              outputSize: result.outputSize ?? null,
              error: null,
              completedAt: Date.now()
            });
          } else {
            updateTaskStatus.run({
              id: taskId,
              status: 'failed',
              progress: 0,
              outputPath: null,
              outputSize: null,
              error: result.error ?? 'Conversion failed',
              completedAt: Date.now()
            });
          }
        } catch (err) {
          updateTaskStatus.run({
            id: taskId,
            status: 'failed',
            progress: 0,
            outputPath: null,
            outputSize: null,
            error: err instanceof Error ? err.message : 'Unknown error',
            completedAt: Date.now()
          });
        }
      });
    }

    const batchId = uuidv4();
    insertBatchJob.run({
      id: batchId,
      taskIds: JSON.stringify(taskIds),
      status: 'processing',
      createdAt: Date.now()
    });

    res.json({
      success: true,
      batchId,
      taskIds
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed to start' });
  }
});

router.get('/batch/:batchId', (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    const batchRow = getBatchJob.get(batchId);
    const batch = rowToBatchJob(batchRow);

    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      return;
    }

    const tasks = batch.taskIds.map((taskId) => {
      const taskRow = getTask.get(taskId);
      return rowToConversionTask(taskRow);
    }).filter(Boolean);

    const completedCount = tasks.filter((t) => t?.status === 'completed').length;
    const failedCount = tasks.filter((t) => t?.status === 'failed').length;
    const processingCount = tasks.filter((t) => t?.status === 'processing').length;

    const allDone = completedCount + failedCount === tasks.length;

    if (allDone && batch.status !== 'completed' && batch.status !== 'failed') {
      updateBatchJob.run({
        id: batchId,
        status: failedCount > 0 ? 'failed' : 'completed',
        completedAt: Date.now(),
        archivePath: null
      });
    }

    res.json({
      success: true,
      batch: {
        ...batch,
        status: allDone ? (failedCount > 0 ? 'failed' : 'completed') : 'processing'
      },
      tasks,
      progress: {
        total: tasks.length,
        completed: completedCount,
        failed: failedCount,
        processing: processingCount,
        pending: tasks.length - completedCount - failedCount - processingCount
      }
    });
  } catch (error) {
    console.error('Batch status error:', error);
    res.status(500).json({ error: 'Failed to get batch status' });
  }
});

router.get('/task/:taskId', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const taskRow = getTask.get(taskId);
    const task = rowToConversionTask(taskRow);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const fileRow = getAudioFile.get(task.fileId);
    const file = rowToAudioFile(fileRow);

    res.json({
      success: true,
      task,
      file
    });
  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({ error: 'Failed to get task status' });
  }
});

router.get('/download/:taskId', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const taskRow = getTask.get(taskId);
    const task = rowToConversionTask(taskRow);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (task.status !== 'completed' || !task.outputPath) {
      res.status(400).json({ error: 'Task not completed or no output' });
      return;
    }

    if (!fs.existsSync(task.outputPath)) {
      res.status(404).json({ error: 'Output file not found' });
      return;
    }

    const fileRow = getAudioFile.get(task.fileId);
    const file = rowToAudioFile(fileRow);
    const originalName = file?.originalName ?? 'audio';
    const downloadName = `${path.basename(originalName, path.extname(originalName))}.${task.options.targetFormat}`;

    res.download(task.outputPath, encodeURIComponent(downloadName), (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

router.get('/download/batch/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    const batchRow = getBatchJob.get(batchId);
    const batch = rowToBatchJob(batchRow);

    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      return;
    }

    if (batch.archivePath && fs.existsSync(batch.archivePath)) {
      res.download(batch.archivePath, `converted_${batchId}.zip`, (err) => {
        if (err) {
          console.error('Archive download error:', err);
        }
      });
      return;
    }

    const tasks = batch.taskIds.map((taskId) => {
      const taskRow = getTask.get(taskId);
      return rowToConversionTask(taskRow);
    }).filter((t): t is NonNullable<ReturnType<typeof rowToConversionTask>> => {
      return t !== null && t.status === 'completed' && t.outputPath !== undefined;
    });

    if (tasks.length === 0) {
      res.status(400).json({ error: 'No completed tasks in batch' });
      return;
    }

    const archiver = await import('archiver');
    const archive = archiver.default('zip', {
      zlib: { level: 9 }
    });

    const archivePath = path.join(ARCHIVE_DIR, `${batchId}.zip`);
    const output = fs.createWriteStream(archivePath);

    output.on('close', () => {
      updateBatchJob.run({
        id: batchId,
        status: 'completed',
        completedAt: Date.now(),
        archivePath
      });

      res.download(archivePath, `converted_${batchId}.zip`, (err) => {
        if (err) {
          console.error('Archive download error:', err);
        }
      });
    });

    archive.on('error', (err: Error) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(output);

    for (const task of tasks) {
      if (!task.outputPath || !fs.existsSync(task.outputPath)) continue;

      const fileRow = getAudioFile.get(task.fileId);
      const file = rowToAudioFile(fileRow);
      const originalName = file?.originalName ?? 'audio';
      const entryName = `${path.basename(originalName, path.extname(originalName))}.${task.options.targetFormat}`;

      archive.file(task.outputPath, { name: entryName });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Batch download error:', error);
    res.status(500).json({ error: 'Batch download failed' });
  }
});

router.get('/file/:fileId/tasks', (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const taskRows = getTasksByFileId.all(fileId) as unknown[];
    const tasks = taskRows.map(rowToConversionTask).filter(Boolean);

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

export default router;
