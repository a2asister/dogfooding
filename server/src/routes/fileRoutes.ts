import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { insertFile, getAllFiles, getFileById, deleteFile as deleteFileFromDb, FileRecord } from '../database';
import { encryptFileStream, decryptFileStream, CHUNK_SIZE } from '../services/encryptionService';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }
});

interface UploadRequest extends Request {
  file: Express.Multer.File;
}

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as UploadRequest;
    if (!multerReq.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileId = uuidv4();
    const encryptedDir = path.join(__dirname, '../../encrypted');
    const encryptionResult = await encryptFileStream(multerReq.file.path, encryptedDir, fileId);

    const fileRecord: FileRecord = {
      id: fileId,
      name: multerReq.file.filename,
      original_name: multerReq.file.originalname,
      mime_type: multerReq.file.mimetype,
      size: multerReq.file.size,
      encrypted_path: encryptionResult.encryptedPath,
      iv: encryptionResult.iv,
      tag: encryptionResult.tag,
      encryption_key: encryptionResult.key,
      chunk_count: encryptionResult.chunkCount,
      chunk_size: CHUNK_SIZE,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    insertFile(fileRecord);

    fs.unlinkSync(multerReq.file.path);

    res.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.original_name,
        size: fileRecord.size,
        mimeType: fileRecord.mime_type,
        createdAt: fileRecord.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/list', (_req: Request, res: Response): void => {
  try {
    const files = getAllFiles();
    res.json({
      files: files.map((f: FileRecord) => ({
        id: f.id,
        name: f.original_name,
        size: f.size,
        mimeType: f.mime_type,
        createdAt: f.created_at,
        chunkCount: f.chunk_count
      }))
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

router.get('/download/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params['id'];
    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }
    const fileRecord = getFileById(fileId);

    if (!fileRecord) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const decryptedData = await decryptFileStream(
      fileRecord.encrypted_path,
      fileRecord.encryption_key,
      fileRecord.iv,
      fileRecord.tag
    );

    res.setHeader('Content-Type', fileRecord.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.original_name}"`);
    res.send(decryptedData);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

router.get('/preview/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params['id'];
    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }
    const fileRecord = getFileById(fileId);

    if (!fileRecord) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const decryptedData = await decryptFileStream(
      fileRecord.encrypted_path,
      fileRecord.encryption_key,
      fileRecord.iv,
      fileRecord.tag
    );

    res.setHeader('Content-Type', fileRecord.mime_type);
    res.send(decryptedData);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to preview file' });
  }
});

router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const fileId = req.params['id'];
    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }
    const fileRecord = getFileById(fileId);

    if (!fileRecord) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (fs.existsSync(fileRecord.encrypted_path)) {
      fs.unlinkSync(fileRecord.encrypted_path);
    }

    deleteFileFromDb(fileId);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const fileId = req.params['id'];
    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }
    const fileRecord = getFileById(fileId);

    if (!fileRecord) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json({
      id: fileRecord.id,
      name: fileRecord.original_name,
      size: fileRecord.size,
      mimeType: fileRecord.mime_type,
      createdAt: fileRecord.created_at,
      chunkCount: fileRecord.chunk_count,
      chunkSize: fileRecord.chunk_size
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

export { router as fileRouter };
