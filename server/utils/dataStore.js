const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../../data');

const readData = (fileName) => {
  const filePath = path.join(dataPath, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data || '[]');
};

const writeData = (fileName, data) => {
  const filePath = path.join(dataPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const generateId = () => uuidv4();

module.exports = {
  readData,
  writeData,
  generateId
};
