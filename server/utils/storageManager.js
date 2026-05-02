const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, '../data/storage.json');

function readStorage() {
  try {
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading storage:', error);
  }
  return { uploadedImages: [], processedImages: [], settings: {} };
}

function writeStorage(data) {
  try {
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing storage:', error);
    return false;
  }
}

function addImages(images) {
  const storage = readStorage();
  if (!storage.uploadedImages) storage.uploadedImages = [];
  storage.uploadedImages.push(...images);
  return writeStorage(storage);
}

function getImagesByIds(ids) {
  const storage = readStorage();
  if (!storage.uploadedImages) return [];
  return storage.uploadedImages.filter(img => ids.includes(img.id));
}

function addProcessedImages(images) {
  const storage = readStorage();
  if (!storage.processedImages) storage.processedImages = [];
  storage.processedImages.unshift(...images);
  return writeStorage(storage);
}

function getProcessedImages() {
  const storage = readStorage();
  return storage.processedImages || [];
}

function getUploadedImages() {
  const storage = readStorage();
  return storage.uploadedImages || [];
}

module.exports = {
  readStorage,
  writeStorage,
  addImages,
  getImagesByIds,
  addProcessedImages,
  getProcessedImages,
  getUploadedImages
};
