import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  Order, 
  OrderStatus, 
  Waybill, 
  WaybillStatus, 
  User, 
  UserRole,
  UserStatus,
  ExceptionItem,
  ExceptionStatus
} from '../models';

export const getDashboardStats = async (ctx: Context) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const [
      totalOrders,
      pendingOrders,
      inTransitOrders,
      deliveredOrders,
      todayOrders,
      todayRevenue,
      pendingExceptions,
      activeCouriers
    ] = await Promise.all([
      Order.count(),
      Order.count({ 
        where: { 
          status: { 
            [Op.in]: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PICKUP_ASSIGNED] 
          } 
        } 
      }),
      Order.count({ 
        where: { 
          status: { 
            [Op.in]: [OrderStatus.PICKED_UP, OrderStatus.TRANSFERRING, OrderStatus.IN_TRANSIT, OrderStatus.ARRIVED, OrderStatus.DELIVERING] 
          } 
        } 
      }),
      Order.count({ where: { status: OrderStatus.DELIVERED } }),
      Order.count({ 
        where: { 
          createdAt: { 
            [Op.between]: [today, tomorrow] 
          } 
        } 
      }),
      Order.sum('totalAmount', { 
        where: { 
          createdAt: { 
            [Op.between]: [today, tomorrow] 
          } 
        } 
      }),
      ExceptionItem.count({ where: { status: ExceptionStatus.PENDING } }),
      User.count({ 
        where: { 
          role: UserRole.COURIER,
          status: UserStatus.ACTIVE
        } 
      })
    ]);

    ctx.body = {
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        inTransitOrders: inTransitOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        todayOrders: todayOrders || 0,
        todayRevenue: todayRevenue || 0,
        pendingExceptions: pendingExceptions || 0,
        activeCouriers: activeCouriers || 0
      }
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ctx.body = {
      success: true,
      data: {
        totalOrders: 0,
        pendingOrders: 0,
        inTransitOrders: 0,
        deliveredOrders: 0,
        todayOrders: 0,
        todayRevenue: 0,
        pendingExceptions: 0,
        activeCouriers: 0
      }
    };
  }
};
