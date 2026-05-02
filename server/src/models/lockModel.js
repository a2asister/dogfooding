const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../../data/locks.json');

const lockModel = {
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
      console.error('写入锁定数据失败:', error);
    }
  },

  createLock(lockInfo) {
    const locks = this.readData();
    const newLock = {
      id: uuidv4(),
      ...lockInfo,
      createdAt: Date.now(),
      expiresAt: Date.now() + lockInfo.duration
    };
    
    const existingIndex = locks.findIndex(lock => 
      lock.sessionId === lockInfo.sessionId && 
      lock.seatId === lockInfo.seatId
    );
    
    if (existingIndex !== -1) {
      locks[existingIndex] = newLock;
    } else {
      locks.push(newLock);
    }
    
    this.writeData(locks);
    return newLock;
  },

  getLockBySeatId(sessionId, seatId) {
    const locks = this.readData();
    return locks.find(lock => 
      lock.sessionId === sessionId && 
      lock.seatId === seatId
    );
  },

  getLockedSeatsBySessionId(sessionId) {
    const locks = this.readData();
    return locks.filter(lock => 
      lock.sessionId === sessionId && 
      lock.expiresAt > Date.now()
    );
  },

  removeLock(lockId) {
    const locks = this.readData();
    const index = locks.findIndex(lock => lock.id === lockId);
    if (index === -1) return false;
    
    locks.splice(index, 1);
    this.writeData(locks);
    return true;
  },

  removeExpiredLocks() {
    const locks = this.readData();
    const now = Date.now();
    const activeLocks = locks.filter(lock => lock.expiresAt > now);
    
    if (activeLocks.length !== locks.length) {
      this.writeData(activeLocks);
      console.log(`已清理 ${locks.length - activeLocks.length} 个过期锁定`);
    }
    
    return activeLocks;
  },

  getLocksByUserId(userId) {
    const locks = this.readData();
    return locks.filter(lock => 
      lock.userId === userId && 
      lock.expiresAt > Date.now()
    );
  }
};

module.exports = lockModel;
