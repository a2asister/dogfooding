const seatModel = require('../models/seatModel');
const lockModel = require('../models/lockModel');

const LOCK_DURATION = 5 * 60 * 1000; // 5分钟锁定时间

const seatController = {
  async getSeatsBySessionId(ctx) {
    try {
      const { sessionId } = ctx.params;
      const seats = seatModel.getSeatsBySessionId(sessionId);
      const lockedSeats = lockModel.getLockedSeatsBySessionId(sessionId);
      
      const seatsWithStatus = seats.map(seat => {
        const isLocked = lockedSeats.some(lock => 
          lock.seatId === seat.id && 
          lock.expiresAt > Date.now()
        );
        
        return {
          ...seat,
          isLocked: isLocked || seat.status === 'locked',
          isSold: seat.status === 'sold',
          isForbidden: seat.status === 'forbidden'
        };
      });
      
      ctx.body = {
        success: true,
        data: {
          seats: seatsWithStatus,
          lockDuration: LOCK_DURATION
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取座位信息失败',
        error: error.message
      };
    }
  },

  async lockSeats(ctx) {
    try {
      const { sessionId, seatIds, userId } = ctx.request.body;
      
      if (!sessionId || !seatIds || seatIds.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '参数不完整'
        };
        return;
      }
      
      const lockedSeats = [];
      const failedSeats = [];
      
      for (const seatId of seatIds) {
        const seat = seatModel.getSeatById(sessionId, seatId);
        
        if (!seat) {
          failedSeats.push({ seatId, reason: '座位不存在' });
          continue;
        }
        
        if (seat.status === 'sold') {
          failedSeats.push({ seatId, reason: '座位已售出' });
          continue;
        }
        
        if (seat.status === 'forbidden') {
          failedSeats.push({ seatId, reason: '座位禁售' });
          continue;
        }
        
        const existingLock = lockModel.getLockBySeatId(sessionId, seatId);
        if (existingLock && existingLock.expiresAt > Date.now()) {
          failedSeats.push({ seatId, reason: '座位已被锁定' });
          continue;
        }
        
        const lock = lockModel.createLock({
          sessionId,
          seatId,
          userId: userId || 'anonymous',
          duration: LOCK_DURATION
        });
        
        lockedSeats.push({
          seatId,
          lockId: lock.id,
          expiresAt: lock.expiresAt
        });
      }
      
      if (failedSeats.length > 0 && lockedSeats.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '锁定座位失败',
          data: { lockedSeats, failedSeats }
        };
        return;
      }
      
      ctx.body = {
        success: true,
        message: failedSeats.length > 0 ? '部分座位锁定成功' : '座位锁定成功',
        data: {
          lockedSeats,
          failedSeats,
          lockDuration: LOCK_DURATION
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '锁定座位失败',
        error: error.message
      };
    }
  },

  async unlockSeats(ctx) {
    try {
      const { sessionId, seatIds, userId } = ctx.request.body;
      
      if (!sessionId || !seatIds || seatIds.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '参数不完整'
        };
        return;
      }
      
      const unlockedSeats = [];
      const failedSeats = [];
      
      for (const seatId of seatIds) {
        const lock = lockModel.getLockBySeatId(sessionId, seatId);
        
        if (!lock) {
          failedSeats.push({ seatId, reason: '座位未被锁定' });
          continue;
        }
        
        if (lock.userId !== userId && userId !== 'admin') {
          failedSeats.push({ seatId, reason: '无权解锁此座位' });
          continue;
        }
        
        lockModel.removeLock(lock.id);
        unlockedSeats.push(seatId);
      }
      
      ctx.body = {
        success: true,
        message: failedSeats.length > 0 ? '部分座位解锁成功' : '座位解锁成功',
        data: {
          unlockedSeats,
          failedSeats
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '解锁座位失败',
        error: error.message
      };
    }
  },

  async confirmSeats(ctx) {
    try {
      const { sessionId, seatIds, userId } = ctx.request.body;
      
      if (!sessionId || !seatIds || seatIds.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '参数不完整'
        };
        return;
      }
      
      const confirmedSeats = [];
      const failedSeats = [];
      
      for (const seatId of seatIds) {
        const lock = lockModel.getLockBySeatId(sessionId, seatId);
        
        if (!lock || lock.expiresAt < Date.now()) {
          failedSeats.push({ seatId, reason: '座位锁定已过期' });
          continue;
        }
        
        if (lock.userId !== userId && userId !== 'admin') {
          failedSeats.push({ seatId, reason: '无权确认此座位' });
          continue;
        }
        
        seatModel.updateSeatStatus(sessionId, seatId, 'sold');
        lockModel.removeLock(lock.id);
        confirmedSeats.push(seatId);
      }
      
      if (confirmedSeats.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '确认座位失败',
          data: { confirmedSeats, failedSeats }
        };
        return;
      }
      
      ctx.body = {
        success: true,
        message: failedSeats.length > 0 ? '部分座位确认成功' : '座位确认成功',
        data: {
          confirmedSeats,
          failedSeats
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '确认座位失败',
        error: error.message
      };
    }
  }
};

module.exports = seatController;
