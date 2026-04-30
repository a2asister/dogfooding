const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

const ensureDataDir = async () => {
  await fs.ensureDir(DATA_DIR);
};

const readJSON = async (filename) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readJSON(filePath);
    return data;
  } catch (error) {
    return [];
  }
};

const writeJSON = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeJSON(filePath, data, { spaces: 2 });
};

module.exports = {
  readJSON,
  writeJSON,
  DATA_DIR
};
