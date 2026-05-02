const sessionModel = require('../models/sessionModel');

const sessionController = {
  async getSessionsByEventId(ctx) {
    try {
      const { eventId } = ctx.params;
      const sessions = sessionModel.getSessionsByEventId(eventId);
      
      ctx.body = {
        success: true,
        data: sessions
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取场次列表失败',
        error: error.message
      };
    }
  },

  async getSessionById(ctx) {
    try {
      const { id } = ctx.params;
      const session = sessionModel.getSessionById(id);
      
      if (!session) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '场次不存在'
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: session
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取场次详情失败',
        error: error.message
      };
    }
  }
};

module.exports = sessionController;
