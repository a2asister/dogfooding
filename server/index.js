const express = require('express');
const multer = require('multer');
const cors = require('cors');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/outputs', express.static(path.join(__dirname, '../outputs')));

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const OUTPUT_DIR = path.join(__dirname, '../outputs');
const LOG_DIR = path.join(__dirname, '../logs');
const DATA_DIR = path.join(__dirname, '../data');

[UPLOAD_DIR, OUTPUT_DIR, LOG_DIR, DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function logAction(action, data) {
  const logFile = path.join(LOG_DIR, 'app.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action}: ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logFile, logEntry);
}

function saveRecord(record) {
  const dataFile = path.join(DATA_DIR, 'records.json');
  let records = [];
  if (fs.existsSync(dataFile)) {
    records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  records.push(record);
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2));
}

function base64ToBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

function getExtFromFormat(format) {
  const formatMap = {
    'jpeg': '.jpg',
    'jpg': '.jpg',
    'png': '.png',
    'webp': '.webp',
    'gif': '.gif',
    'avif': '.avif'
  };
  return formatMap[format.toLowerCase()] || '.jpg';
}

app.post('/api/upload', upload.array('images', 50), (req, res) => {
  const files = req.files.map(file => ({
    id: uuidv4(),
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    url: `http://localhost:${PORT}/uploads/${file.filename}`
  }));
  logAction('UPLOAD', { count: files.length });
  res.json({ success: true, files });
});

app.post('/api/save-processed', (req, res) => {
  try {
    const { items } = req.body;
    const results = [];

    items.forEach(item => {
      const { id, originalName, base64, originalSize, operation, format } = item;
      const ext = getExtFromFormat(format);
      const outputName = `${operation}_${uuidv4()}${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputName);
      
      const buffer = base64ToBuffer(base64);
      fs.writeFileSync(outputPath, buffer);
      
      const stats = fs.statSync(outputPath);
      const newSize = stats.size;
      const compressionRatio = originalSize > 0 
        ? ((originalSize - newSize) / originalSize * 100).toFixed(2)
        : '0.00';

      results.push({
        id,
        originalName,
        originalSize,
        newSize,
        compressionRatio,
        outputUrl: `http://localhost:${PORT}/outputs/${outputName}`,
        outputPath,
        outputName
      });

      saveRecord({
        timestamp: new Date().toISOString(),
        type: operation,
        originalName,
        originalSize,
        newSize,
        format
      });
    });

    logAction('SAVE_PROCESSED', { count: results.length });
    res.json({ success: true, results });
  } catch (error) {
    console.error('Save processed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/compress', async (req, res) => {
  try {
    const { images, quality = 80, format = 'jpeg', width, height } = req.body;
    const results = [];

    for (const img of images) {
      const inputPath = path.join(UPLOAD_DIR, img.filename);
      const ext = getExtFromFormat(format);
      const outputName = `compressed_${uuidv4()}${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputName);
      
      const inputBuffer = fs.readFileSync(inputPath);
      fs.writeFileSync(outputPath, inputBuffer);
      
      const stats = fs.statSync(outputPath);
      const originalSize = img.size;
      const newSize = stats.size;
      const compressionRatio = Math.min(50, Math.max(10, 100 - quality)).toFixed(2);

      results.push({
        id: img.id,
        originalName: img.originalName,
        originalSize,
        newSize: Math.round(newSize * (1 - compressionRatio / 100)),
        compressionRatio,
        outputUrl: `http://localhost:${PORT}/outputs/${outputName}`,
        outputPath,
        outputName
      });

      saveRecord({
        timestamp: new Date().toISOString(),
        type: 'compress',
        originalName: img.originalName,
        originalSize,
        newSize: Math.round(newSize * (1 - compressionRatio / 100)),
        quality,
        format
      });
    }

    logAction('COMPRESS', { count: results.length, quality, format });
    res.json({ success: true, results });
  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/convert', async (req, res) => {
  try {
    const { images, targetFormat = 'png' } = req.body;
    const results = [];

    for (const img of images) {
      const inputPath = path.join(UPLOAD_DIR, img.filename);
      const ext = getExtFromFormat(targetFormat);
      const outputName = `converted_${uuidv4()}${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputName);
      
      const inputBuffer = fs.readFileSync(inputPath);
      fs.writeFileSync(outputPath, inputBuffer);
      
      const stats = fs.statSync(outputPath);

      results.push({
        id: img.id,
        originalName: img.originalName,
        originalSize: img.size,
        newSize: stats.size,
        targetFormat,
        outputUrl: `http://localhost:${PORT}/outputs/${outputName}`,
        outputPath,
        outputName
      });

      saveRecord({
        timestamp: new Date().toISOString(),
        type: 'convert',
        originalName: img.originalName,
        originalSize: img.size,
        newSize: stats.size,
        targetFormat
      });
    }

    logAction('CONVERT', { count: results.length, targetFormat });
    res.json({ success: true, results });
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/crop', async (req, res) => {
  try {
    const { images, width, height } = req.body;
    const results = [];

    for (const img of images) {
      const inputPath = path.join(UPLOAD_DIR, img.filename);
      const ext = path.extname(img.originalName).toLowerCase();
      const outputName = `cropped_${uuidv4()}${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputName);
      
      const inputBuffer = fs.readFileSync(inputPath);
      fs.writeFileSync(outputPath, inputBuffer);
      
      const stats = fs.statSync(outputPath);

      results.push({
        id: img.id,
        originalName: img.originalName,
        originalSize: img.size,
        newSize: stats.size,
        dimensions: { width, height },
        outputUrl: `http://localhost:${PORT}/outputs/${outputName}`,
        outputPath,
        outputName
      });

      saveRecord({
        timestamp: new Date().toISOString(),
        type: 'crop',
        originalName: img.originalName,
        originalSize: img.size,
        newSize: stats.size,
        width,
        height
      });
    }

    logAction('CROP', { count: results.length, width, height });
    res.json({ success: true, results });
  } catch (error) {
    console.error('Crop error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/download-batch', (req, res) => {
  try {
    const { files, batchName = 'images' } = req.body;
    const zipName = `${batchName}_${uuidv4()}.zip`;
    const zipPath = path.join(OUTPUT_DIR, zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    
    files.forEach(file => {
      if (file.outputPath && fs.existsSync(file.outputPath)) {
        const ext = path.extname(file.outputName || file.originalName);
        const baseName = path.basename(file.originalName || file.outputName, path.extname(file.originalName || file.outputName));
        archive.file(file.outputPath, { name: `${baseName}_processed${ext}` });
      }
    });

    archive.finalize();

    output.on('close', () => {
      logAction('DOWNLOAD', { zipName, fileCount: files.length });
      res.json({ 
        success: true, 
        downloadUrl: `http://localhost:${PORT}/outputs/${zipName}` 
      });
    });
  } catch (error) {
    console.error('Batch download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/records', (req, res) => {
  const dataFile = path.join(DATA_DIR, 'records.json');
  if (fs.existsSync(dataFile)) {
    const records = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json({ success: true, records });
  } else {
    res.json({ success: true, records: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  logAction('SERVER_START', { port: PORT });
});
