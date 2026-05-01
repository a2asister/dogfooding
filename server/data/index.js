const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function getDataFile(fileName) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2))
    return []
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function saveDataFile(fileName, data) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

module.exports = {
  getDataFile,
  saveDataFile
}
