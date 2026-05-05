const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JSONStore {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, filename);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`读取文件 ${this.filePath} 失败:`, error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`写入文件 ${this.filePath} 失败:`, error);
      return false;
    }
  }

  append(item) {
    const data = this.read();
    data.push(item);
    return this.write(data);
  }

  find(predicate) {
    const data = this.read();
    return data.filter(predicate);
  }

  findOne(predicate) {
    const data = this.read();
    return data.find(predicate);
  }
}

module.exports = {
  logsStore: new JSONStore('logs.json'),
  tracesStore: new JSONStore('traces.json'),
  alertsStore: new JSONStore('alerts.json'),
  alertRulesStore: new JSONStore('alert-rules.json'),
  servicesStore: new JSONStore('services.json')
};
