const lockModel = require('../models/lockModel');

const LOCK_CLEANUP_INTERVAL = 60 * 1000; // 每分钟清理一次

let cleanupInterval = null;

const lockCleaner = {
  start() {
    if (cleanupInterval) {
      console.log('锁清理服务已经在运行中');
      return;
    }
    
    console.log('启动锁清理服务');
    this.cleanup(); // 立即执行一次清理
    cleanupInterval = setInterval(() => {
      this.cleanup();
    }, LOCK_CLEANUP_INTERVAL);
  },

  stop() {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
      console.log('锁清理服务已停止');
    }
  },

  cleanup() {
    try {
      console.log('开始清理过期座位锁定...');
      const activeLocks = lockModel.removeExpiredLocks();
      console.log(`当前活跃锁定数: ${activeLocks.length}`);
    } catch (error) {
      console.error('清理过期锁定时发生错误:', error);
    }
  },

  getActiveLocksCount() {
    const locks = lockModel.readData();
    const now = Date.now();
    return locks.filter(lock => lock.expiresAt > now).length;
  }
};

const initializeLockCleaner = () => {
  lockCleaner.start();
};

module.exports = {
  initializeLockCleaner,
  lockCleaner
};
