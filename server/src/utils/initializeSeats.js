const fs = require('fs');
const path = require('path');
const seatModel = require('../models/seatModel');
const sessionModel = require('../models/sessionModel');

const initializeSeats = () => {
  const sessions = sessionModel.readData();
  
  for (const session of sessions) {
    const existingSeats = seatModel.getSeatsBySessionId(session.id);
    
    if (existingSeats.length === 0) {
      console.log(`正在为场次 ${session.id} 生成座位数据...`);
      seatModel.createSeatsForSession(session.id, session.sections);
      console.log(`场次 ${session.id} 座位数据生成完成`);
    } else {
      console.log(`场次 ${session.id} 已有 ${existingSeats.length} 个座位，跳过生成`);
    }
  }
  
  console.log('座位数据初始化完成');
};

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initializeSeats();
}

module.exports = initializeSeats;
