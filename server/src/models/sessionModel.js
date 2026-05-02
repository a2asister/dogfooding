const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/sessions.json');

const sessionModel = {
  readData() {
    try {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },

  writeData(data) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('写入场次数据失败:', error);
    }
  },

  getSessionsByEventId(eventId) {
    const sessions = this.readData();
    return sessions.filter(session => session.eventId === eventId);
  },

  getSessionById(id) {
    const sessions = this.readData();
    return sessions.find(session => session.id === id);
  },

  createSession(session) {
    const sessions = this.readData();
    const newSession = {
      ...session,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    sessions.push(newSession);
    this.writeData(sessions);
    return newSession;
  },

  updateSession(id, updates) {
    const sessions = this.readData();
    const index = sessions.findIndex(session => session.id === id);
    if (index === -1) return null;
    
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: Date.now()
    };
    this.writeData(sessions);
    return sessions[index];
  },

  deleteSession(id) {
    const sessions = this.readData();
    const index = sessions.findIndex(session => session.id === id);
    if (index === -1) return false;
    
    sessions.splice(index, 1);
    this.writeData(sessions);
    return true;
  }
};

module.exports = sessionModel;
