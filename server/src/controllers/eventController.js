const eventModel = require('../models/eventModel');

const eventController = {
  async getEvents(ctx) {
    try {
      const events = eventModel.getAllEvents();
      ctx.body = {
        success: true,
        data: events
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取演出列表失败',
        error: error.message
      };
    }
  },

  async getEventById(ctx) {
    try {
      const { id } = ctx.params;
      const event = eventModel.getEventById(id);
      
      if (!event) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '演出不存在'
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: event
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取演出详情失败',
        error: error.message
      };
    }
  }
};

module.exports = eventController;
