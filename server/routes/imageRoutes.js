const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const imageProcessor = require('../utils/imageProcessor');
const storageManager = require('../utils/storageManager');

const uploadsDir = path.join(__dirname, '../uploads');
const processedDir = path.join(__dirname, '../processed');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/upload', upload.array('images', 50), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadTime: new Date().toISOString(),
      url: `http://localhost:3001/uploads/${file.filename}`
    }));
    
    storageManager.addImages(uploadedFiles);
    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.post('/compress', async (req, res) => {
  try {
    const { imageIds, quality = 80, format } = req.body;
    const images = storageManager.getImagesByIds(imageIds);
    
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'Images not found' });
    }
    
    const results = [];
    for (const image of images) {
      const inputPath = path.join(uploadsDir, image.filename);
      const outputFilename = `${uuidv4()}.${format || path.extname(image.filename).slice(1)}`;
      const outputPath = path.join(processedDir, outputFilename);
      
      const result = await imageProcessor.compressImage(inputPath, outputPath, {
        quality,
        format: format || path.extname(image.filename).slice(1)
      });
      
      results.push({
        id: uuidv4(),
        originalId: image.id,
        originalName: image.originalName,
        processedName: outputFilename,
        size: result.size,
        originalSize: image.size,
        compressionRate: ((image.size - result.size) / image.size * 100).toFixed(2) + '%',
        url: `http://localhost:3001/processed/${outputFilename}`,
        processType: 'compress',
        processTime: new Date().toISOString()
      });
    }
    
    storageManager.addProcessedImages(results);
    res.json({ success: true, processedImages: results });
  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({ error: 'Compression failed', message: error.message });
  }
});

router.post('/crop', async (req, res) => {
  try {
    const { imageIds, width, height, left = 0, top = 0 } = req.body;
    const images = storageManager.getImagesByIds(imageIds);
    
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'Images not found' });
    }
    
    const results = [];
    for (const image of images) {
      const inputPath = path.join(uploadsDir, image.filename);
      const outputFilename = `${uuidv4()}${path.extname(image.filename)}`;
      const outputPath = path.join(processedDir, outputFilename);
      
      const result = await imageProcessor.cropImage(inputPath, outputPath, {
        width, height, left, top
      });
      
      results.push({
        id: uuidv4(),
        originalId: image.id,
        originalName: image.originalName,
        processedName: outputFilename,
        size: result.size,
        dimensions: result.dimensions,
        url: `http://localhost:3001/processed/${outputFilename}`,
        processType: 'crop',
        processTime: new Date().toISOString()
      });
    }
    
    storageManager.addProcessedImages(results);
    res.json({ success: true, processedImages: results });
  } catch (error) {
    console.error('Crop error:', error);
    res.status(500).json({ error: 'Crop failed', message: error.message });
  }
});

router.post('/convert', async (req, res) => {
  try {
    const { imageIds, format, quality = 80 } = req.body;
    const images = storageManager.getImagesByIds(imageIds);
    
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'Images not found' });
    }
    
    const results = [];
    for (const image of images) {
      const inputPath = path.join(uploadsDir, image.filename);
      const outputFilename = `${uuidv4()}.${format}`;
      const outputPath = path.join(processedDir, outputFilename);
      
      const result = await imageProcessor.convertFormat(inputPath, outputPath, {
        format, quality
      });
      
      results.push({
        id: uuidv4(),
        originalId: image.id,
        originalName: image.originalName,
        processedName: outputFilename,
        size: result.size,
        format: format,
        url: `http://localhost:3001/processed/${outputFilename}`,
        processType: 'convert',
        processTime: new Date().toISOString()
      });
    }
    
    storageManager.addProcessedImages(results);
    res.json({ success: true, processedImages: results });
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ error: 'Conversion failed', message: error.message });
  }
});

router.post('/watermark', async (req, res) => {
  try {
    const { imageIds, watermarkText, position = 'southeast', opacity = 0.3, fontSize = 48, fontColor = '#ffffff' } = req.body;
    const images = storageManager.getImagesByIds(imageIds);
    
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'Images not found' });
    }
    
    const results = [];
    for (const image of images) {
      const inputPath = path.join(uploadsDir, image.filename);
      const outputFilename = `${uuidv4()}${path.extname(image.filename)}`;
      const outputPath = path.join(processedDir, outputFilename);
      
      const result = await imageProcessor.addWatermark(inputPath, outputPath, {
        watermarkText, position, opacity, fontSize, fontColor
      });
      
      results.push({
        id: uuidv4(),
        originalId: image.id,
        originalName: image.originalName,
        processedName: outputFilename,
        size: result.size,
        watermarkText,
        url: `http://localhost:3001/processed/${outputFilename}`,
        processType: 'watermark',
        processTime: new Date().toISOString()
      });
    }
    
    storageManager.addProcessedImages(results);
    res.json({ success: true, processedImages: results });
  } catch (error) {
    console.error('Watermark error:', error);
    res.status(500).json({ error: 'Watermark addition failed', message: error.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const history = storageManager.getProcessedImages();
    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get history', message: error.message });
  }
});

router.get('/uploaded', (req, res) => {
  try {
    const images = storageManager.getUploadedImages();
    res.json({ success: true, images });
  } catch (error) {
    console.error('Uploaded images error:', error);
    res.status(500).json({ error: 'Failed to get uploaded images', message: error.message });
  }
});

module.exports = router;
