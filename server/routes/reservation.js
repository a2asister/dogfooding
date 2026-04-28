const Router = require('@koa/router');
const router = new Router();
const { Reservation, RESERVATION_CHANNEL, AccessLog } = require('../models');

// 手机号格式校验
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 预约渠道校验
function validateChannel(channel) {
  const validChannels = [
    RESERVATION_CHANNEL.ANDROID,
    RESERVATION_CHANNEL.IOS,
    RESERVATION_CHANNEL.PC
  ];
  return validChannels.includes(channel);
}

// 预约提交接口
router.post('/', async (ctx) => {
  try {
    const { phone, channel } = ctx.request.body;
    const ipAddress = ctx.ip;
    const userAgent = ctx.get('User-Agent');

    // 记录访问日志
    try {
      await AccessLog.logAccess(ctx);
    } catch (logError) {
      console.error('记录访问日志失败:', logError);
    }

    // 参数校验
    if (!phone || !phone.trim()) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请输入手机号'
      };
      return;
    }

    if (!validatePhone(phone)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请输入正确的手机号格式'
      };
      return;
    }

    if (!channel) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请选择预约渠道'
      };
      return;
    }

    if (!validateChannel(channel)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的预约渠道'
      };
      return;
    }

    // 检查是否已经预约
    const existingReservation = await Reservation.getByPhone(phone);
    if (existingReservation) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '该手机号已预约，请不要重复预约'
      };
      return;
    }

    // 检查 IP 限制（60 分钟内最多 5 次预约）
    const ipLimitExceeded = await Reservation.checkIPLimit(ipAddress, 60, 5);
    if (ipLimitExceeded) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        message: '预约频率过高，请稍后再试'
      };
      return;
    }

    // 检查特定路径的访问频率（1 分钟内最多 3 次）
    const pathAccessCount = await AccessLog.checkPathAccessCount(
      ipAddress,
      ctx.path,
      1,
      3
    );
    if (pathAccessCount >= 3) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        message: '操作过于频繁，请稍后再试'
      };
      return;
    }

    // 创建预约记录
    const reservation = await Reservation.createReservation({
      phone,
      channel,
      ipAddress,
      userAgent
    });

    // 返回成功响应
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '预约成功',
      data: {
        phone: reservation.phone,
        channel: reservation.channel,
        status: reservation.status,
        reservationTime: reservation.created_at
      }
    };

  } catch (error) {
    console.error('预约失败:', error);
    
    // 处理唯一约束错误（重复预约）
    if (error.name === 'SequelizeUniqueConstraintError') {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '该手机号已预约，请不要重复预约'
      };
      return;
    }

    // 其他错误
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '预约失败，请稍后重试'
    };
  }
});

module.exports = router;
