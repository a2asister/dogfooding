const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DataStore {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getDataPath() {
    return path.join(this.dataDir, `${this.serviceName}.json`);
  }

  read() {
    const dataPath = this.getDataPath();
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  }

  write(data) {
    const dataPath = this.getDataPath();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  findAll() {
    return this.read();
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item.id === id);
  }

  create(item) {
    const data = this.read();
    const newItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  update(id, item) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    data[index] = {
      ...data[index],
      ...item,
      updatedAt: new Date().toISOString()
    };
    this.write(data);
    return data[index];
  }

  delete(id) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    data.splice(index, 1);
    this.write(data);
    return true;
  }

  findBy(filter) {
    const data = this.read();
    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
}

module.exports = DataStore;
