const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/events.json');

const eventModel = {
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
      console.error('写入演出数据失败:', error);
    }
  },

  getAllEvents() {
    return this.readData();
  },

  getEventById(id) {
    const events = this.readData();
    return events.find(event => event.id === id);
  },

  createEvent(event) {
    const events = this.readData();
    const newEvent = {
      ...event,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    events.push(newEvent);
    this.writeData(events);
    return newEvent;
  },

  updateEvent(id, updates) {
    const events = this.readData();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return null;
    
    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: Date.now()
    };
    this.writeData(events);
    return events[index];
  },

  deleteEvent(id) {
    const events = this.readData();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return false;
    
    events.splice(index, 1);
    this.writeData(events);
    return true;
  }
};

module.exports = eventModel;
