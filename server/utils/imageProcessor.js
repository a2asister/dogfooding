const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

function getImageFormat(format) {
  const formats = {
    'jpeg': 'jpeg',
    'jpg': 'jpeg',
    'png': 'png',
    'gif': 'gif',
    'webp': 'webp',
    'bmp': 'bmp'
  };
  return formats[format.toLowerCase()] || 'jpeg';
}

function getMimeTypeFromFormat(format) {
  const mimeTypes = {
    'jpeg': Jimp.MIME_JPEG,
    'jpg': Jimp.MIME_JPEG,
    'png': Jimp.MIME_PNG,
    'gif': Jimp.MIME_PNG,
    'webp': Jimp.MIME_PNG,
    'bmp': Jimp.MIME_BMP
  };
  return mimeTypes[format.toLowerCase()] || Jimp.MIME_JPEG;
}

function hexToRgba(hex, opacity = 1) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = Math.floor(opacity * 255);
  return { r, g, b, a };
}

async function createTextWatermark(text, width, height, options = {}) {
  const { 
    fontSize = 48, 
    fontColor = '#ffffff', 
    opacity = 0.3,
    position = 'southeast'
  } = options;
  
  const watermark = new Jimp(width, height, 0x00000000);
  
  const { r, g, b, a } = hexToRgba(fontColor, opacity);
  const rgbaColor = (r << 24) | (g << 16) | (b << 8) | a;
  
  const fontSizeActual = Math.min(fontSize, Math.min(width, height) * 0.1);
  const charWidth = fontSizeActual * 0.6;
  const textWidth = text.length * charWidth;
  const textHeight = fontSizeActual;
  
  const positions = {
    'northwest': { x: 20, y: 20 },
    'northeast': { x: width - textWidth - 20, y: 20 },
    'southwest': { x: 20, y: height - textHeight - 20 },
    'southeast': { x: width - textWidth - 20, y: height - textHeight - 20 },
    'center': { x: (width - textWidth) / 2, y: (height - textHeight) / 2 },
    'north': { x: (width - textWidth) / 2, y: 20 },
    'south': { x: (width - textWidth) / 2, y: height - textHeight - 20 },
    'west': { x: 20, y: (height - textHeight) / 2 },
    'east': { x: width - textWidth - 20, y: (height - textHeight) / 2 }
  };
  
  const pos = positions[position] || positions['southeast'];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charX = pos.x + i * charWidth;
    
    for (let dy = 0; dy < textHeight; dy++) {
      for (let dx = 0; dx < charWidth * 0.7; dx++) {
        const px = Math.floor(charX + dx);
        const py = Math.floor(pos.y + dy);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const centerX = charWidth * 0.35;
          const centerY = textHeight * 0.5;
          const distX = Math.abs(dx - centerX);
          const distY = Math.abs(dy - centerY);
          
          if (distX < charWidth * 0.3 && distY < textHeight * 0.4) {
            watermark.setPixelColor(rgbaColor, px, py);
          }
        }
      }
    }
  }
  
  return watermark;
}

async function compressImage(inputPath, outputPath, options = {}) {
  const { quality = 80, format } = options;
  const imageFormat = getImageFormat(format || path.extname(inputPath).slice(1));
  
  const image = await Jimp.read(inputPath);
  const mimeType = getMimeTypeFromFormat(imageFormat);
  
  if (imageFormat === 'jpeg' || imageFormat === 'jpg') {
    image.quality(quality);
  }
  
  await image.writeAsync(outputPath);
  
  const stats = fs.statSync(outputPath);
  return {
    size: stats.size,
    quality
  };
}

async function cropImage(inputPath, outputPath, options = {}) {
  const { width, height, left = 0, top = 0 } = options;
  
  const image = await Jimp.read(inputPath);
  const imageWidth = image.bitmap.width;
  const imageHeight = image.bitmap.height;
  
  const actualWidth = width || imageWidth;
  const actualHeight = height || imageHeight;
  
  const actualLeft = Math.min(left, imageWidth - actualWidth);
  const actualTop = Math.min(top, imageHeight - actualHeight);
  const finalWidth = Math.min(actualWidth, imageWidth);
  const finalHeight = Math.min(actualHeight, imageHeight);
  
  image.crop(actualLeft, actualTop, finalWidth, finalHeight);
  await image.writeAsync(outputPath);
  
  const stats = fs.statSync(outputPath);
  return {
    size: stats.size,
    dimensions: { width: finalWidth, height: finalHeight }
  };
}

async function convertFormat(inputPath, outputPath, options = {}) {
  const { format, quality = 80 } = options;
  const imageFormat = getImageFormat(format);
  
  const image = await Jimp.read(inputPath);
  
  if (imageFormat === 'jpeg' || imageFormat === 'jpg') {
    image.quality(quality);
  }
  
  await image.writeAsync(outputPath);
  
  const stats = fs.statSync(outputPath);
  return {
    size: stats.size,
    format: imageFormat
  };
}

async function addWatermark(inputPath, outputPath, options = {}) {
  const { 
    watermarkText, 
    position = 'southeast', 
    opacity = 0.3, 
    fontSize = 48,
    fontColor = '#ffffff'
  } = options;
  
  const image = await Jimp.read(inputPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  const watermark = await createTextWatermark(watermarkText, width, height, {
    fontSize,
    fontColor,
    opacity,
    position
  });
  
  image.composite(watermark, 0, 0);
  await image.writeAsync(outputPath);
  
  const stats = fs.statSync(outputPath);
  return {
    size: stats.size,
    watermarkText
  };
}

module.exports = {
  compressImage,
  cropImage,
  convertFormat,
  addWatermark
};
