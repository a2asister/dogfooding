const Router = require('@koa/router');
const router = new Router();
const { Reservation, RESERVATION_STATUS, AccessLog } = require('../models');

// 手机号格式校验
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 预约状态枚举（与前端保持一致）
const QUERY_STATUS = {
  NOT_FOUND: 'not_found',
  PENDING: 'pending',
  SUCCESS: 'success',
  EXPIRED: 'expired'
};

// 检查预约资格是否过期（超过7天）
function isReservationExpired(createdAt) {
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
  return diffDays > 7;
}

// 预约资格查询接口
router.get('/', async (ctx) => {
  try {
    const { phone } = ctx.query;
    const ipAddress = ctx.ip;

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

    // 检查特定路径的访问频率（1 分钟内最多 5 次）
    const pathAccessCount = await AccessLog.checkPathAccessCount(
      ipAddress,
      ctx.path,
      1,
      5
    );
    if (pathAccessCount >= 5) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        message: '查询过于频繁，请稍后再试'
      };
      return;
    }

    // 查询预约信息
    const reservation = await Reservation.getByPhone(phone);

    // 如果没有找到预约记录
    if (!reservation) {
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          status: QUERY_STATUS.NOT_FOUND,
          phone: phone
        }
      };
      return;
    }

    // 检查预约是否过期
    let status = reservation.status;
    if (reservation.status === RESERVATION_STATUS.SUCCESS && isReservationExpired(reservation.created_at)) {
      status = QUERY_STATUS.EXPIRED;
    }

    // 映射后端状态到前端状态
    let queryStatus;
    switch (status) {
      case RESERVATION_STATUS.PENDING:
        queryStatus = QUERY_STATUS.PENDING;
        break;
      case RESERVATION_STATUS.SUCCESS:
        queryStatus = QUERY_STATUS.SUCCESS;
        break;
      case RESERVATION_STATUS.EXPIRED:
        queryStatus = QUERY_STATUS.EXPIRED;
        break;
      default:
        queryStatus = QUERY_STATUS.NOT_FOUND;
    }

    // 返回查询结果
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        status: queryStatus,
        phone: reservation.phone,
        channel: reservation.channel,
        reservationTime: reservation.created_at,
        statusText: getStatusText(queryStatus)
      }
    };

  } catch (error) {
    console.error('查询预约资格失败:', error);
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '查询失败，请稍后重试'
    };
  }
});

// 获取状态文本描述
function getStatusText(status) {
  switch (status) {
    case QUERY_STATUS.NOT_FOUND:
      return '未找到预约记录';
    case QUERY_STATUS.PENDING:
      return '预约审核中';
    case QUERY_STATUS.SUCCESS:
      return '预约成功';
    case QUERY_STATUS.EXPIRED:
      return '资格已失效';
    default:
      return '未知状态';
  }
}

module.exports = router;
