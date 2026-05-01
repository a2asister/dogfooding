const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readData(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
}

function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getAll(fileName) {
  const data = readData(fileName);
  return data ? (Array.isArray(data) ? data : data.items || []) : [];
}

function getById(fileName, id) {
  const items = getAll(fileName);
  return items.find(item => item.id === id);
}

function create(fileName, item) {
  const data = readData(fileName) || { items: [] };
  if (Array.isArray(data)) {
    data.push(item);
    writeData(fileName, data);
  } else {
    data.items = data.items || [];
    data.items.push(item);
    writeData(fileName, data);
  }
  return item;
}

function update(fileName, id, updatedItem) {
  const data = readData(fileName) || { items: [] };
  if (Array.isArray(data)) {
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedItem };
      writeData(fileName, data);
      return data[index];
    }
  } else {
    data.items = data.items || [];
    const index = data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      data.items[index] = { ...data.items[index], ...updatedItem };
      writeData(fileName, data);
      return data.items[index];
    }
  }
  return null;
}

function remove(fileName, id) {
  const data = readData(fileName) || { items: [] };
  if (Array.isArray(data)) {
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = data.splice(index, 1)[0];
      writeData(fileName, data);
      return deleted;
    }
  } else {
    data.items = data.items || [];
    const index = data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = data.items.splice(index, 1)[0];
      writeData(fileName, data);
      return deleted;
    }
  }
  return null;
}

module.exports = {
  readData,
  writeData,
  getAll,
  getById,
  create,
  update,
  remove
};
