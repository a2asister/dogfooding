const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const getStore = (filename, defaultData = []) => {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const saveStore = (filename, data) => {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getProjects = () => getStore('projects.json', []);
const saveProjects = (data) => saveStore('projects.json', data);

const getTestCases = () => getStore('testCases.json', []);
const saveTestCases = (data) => saveStore('testCases.json', data);

const getTestSuites = () => getStore('testSuites.json', []);
const saveTestSuites = (data) => saveStore('testSuites.json', data);

const getTasks = () => getStore('tasks.json', []);
const saveTasks = (data) => saveStore('tasks.json', data);

const getTestRuns = () => getStore('testRuns.json', []);
const saveTestRuns = (data) => saveStore('testRuns.json', data);

const getEnvironments = () => getStore('environments.json', []);
const saveEnvironments = (data) => saveStore('environments.json', data);

const getUsers = () => getStore('users.json', [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() }
]);
const saveUsers = (data) => saveStore('users.json', data);

const getParameters = () => getStore('parameters.json', []);
const saveParameters = (data) => saveStore('parameters.json', data);

const getDefects = () => getStore('defects.json', []);
const saveDefects = (data) => saveStore('defects.json', data);

module.exports = {
  getProjects,
  saveProjects,
  getTestCases,
  saveTestCases,
  getTestSuites,
  saveTestSuites,
  getTasks,
  saveTasks,
  getTestRuns,
  saveTestRuns,
  getEnvironments,
  saveEnvironments,
  getUsers,
  saveUsers,
  getParameters,
  saveParameters,
  getDefects,
  saveDefects
};
