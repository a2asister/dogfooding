import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  Order, 
  OrderStatus, 
  PackageType, 
  PaymentMethod,
  Waybill,
  WaybillStatus,
  TrackingRecord,
  TrackingEvent,
  Branch,
  User
} from '../models';
import { generateOrderNo, generateWaybillNo } from '../utils/auth';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: string;
    };
  };
}

export const createOrder = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const orderData = ctx.request.body as Partial<Order>;

  const requiredFields = [
    'senderName', 'senderPhone', 'senderProvince', 'senderCity', 
    'senderDistrict', 'senderAddress',
    'receiverName', 'receiverPhone', 'receiverProvince', 'receiverCity',
    'receiverDistrict', 'receiverAddress',
    'packageName', 'packageCount'
  ];

  const missingFields = requiredFields.filter((field) => !orderData[field as keyof typeof orderData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const orderNo = generateOrderNo();

  const order = await Order.create({
    orderNo,
    customerId: userId,
    senderName: orderData.senderName as string,
    senderPhone: orderData.senderPhone as string,
    senderProvince: orderData.senderProvince as string,
    senderCity: orderData.senderCity as string,
    senderDistrict: orderData.senderDistrict as string,
    senderAddress: orderData.senderAddress as string,
    senderLongitude: orderData.senderLongitude,
    senderLatitude: orderData.senderLatitude,
    receiverName: orderData.receiverName as string,
    receiverPhone: orderData.receiverPhone as string,
    receiverProvince: orderData.receiverProvince as string,
    receiverCity: orderData.receiverCity as string,
    receiverDistrict: orderData.receiverDistrict as string,
    receiverAddress: orderData.receiverAddress as string,
    receiverLongitude: orderData.receiverLongitude,
    receiverLatitude: orderData.receiverLatitude,
    packageName: orderData.packageName as string,
    packageType: orderData.packageType || PackageType.PARCEL,
    packageCount: orderData.packageCount as number,
    packageWeight: orderData.packageWeight,
    packageLength: orderData.packageLength,
    packageWidth: orderData.packageWidth,
    packageHeight: orderData.packageHeight,
    volume: orderData.volume,
    declaredValue: orderData.declaredValue,
    isInsured: orderData.isInsured || false,
    insuranceFee: orderData.insuranceFee,
    serviceType: orderData.serviceType || 'standard',
    status: OrderStatus.PENDING,
    paymentMethod: orderData.paymentMethod || PaymentMethod.ONLINE,
    totalAmount: orderData.totalAmount,
    courierId: orderData.courierId,
    pickupBranchId: orderData.pickupBranchId,
    deliveryBranchId: orderData.deliveryBranchId,
    remark: orderData.remark
  });

  const waybillNo = generateWaybillNo();
  const waybill = await Waybill.create({
    waybillNo,
    orderId: order.id,
    status: WaybillStatus.CREATED
  });

  await TrackingRecord.create({
    waybillId: waybill.id,
    event: TrackingEvent.ORDER_CREATED,
    eventTime: new Date(),
    description: '订单已创建'
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '订单创建成功',
    data: {
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status
      },
      waybill: {
        id: waybill.id,
        waybillNo: waybill.waybillNo
      }
    }
  };
};

export const getOrders = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, keyword, startDate, endDate } = ctx.query;
  
  const userId = ctx.state.user.userId;
  const userRole = ctx.state.user.role;

  const where: any = {};
  
  if (userRole === 'customer') {
    where.customerId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (keyword) {
    where[Op.or] = [
      { orderNo: { [Op.like]: `%${keyword}%` } },
      { senderName: { [Op.like]: `%${keyword}%` } },
      { receiverName: { [Op.like]: `%${keyword}%` } },
      { senderPhone: { [Op.like]: `%${keyword}%` } },
      { receiverPhone: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: Waybill,
        as: 'waybill',
        required: false
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'name', 'phone'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });

  ctx.body = {
    success: true,
    data: {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / limit)
    }
  };
};

export const getOrderById = async (ctx: Context) => {
  const { id } = ctx.params;

  const order = await Order.findByPk(id, {
    include: [
      {
        model: Waybill,
        as: 'waybill',
        include: [
          {
            model: TrackingRecord,
            as: 'trackingRecords',
            order: [['eventTime', 'DESC']]
          }
        ]
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'name', 'phone'],
        required: false
      },
      {
        model: Branch,
        as: 'pickupBranch',
        required: false
      },
      {
        model: Branch,
        as: 'deliveryBranch',
        required: false
      }
    ]
  });

  if (!order) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '订单不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: order
  };
};

export const updateOrder = async (ctx: Context) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<Order>;

  const order = await Order.findByPk(id);

  if (!order) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '订单不存在'
    };
    return;
  }

  const nonUpdatableStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.RETURNED
  ];

  if (nonUpdatableStatuses.includes(order.status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '当前订单状态不允许修改'
    };
    return;
  }

  await order.update(updateData);

  ctx.body = {
    success: true,
    message: '订单更新成功',
    data: order
  };
};

export const cancelOrder = async (ctx: AuthContext) => {
  const { id } = ctx.params;
  const userId = ctx.state.user.userId;

  const order = await Order.findByPk(id);

  if (!order) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '订单不存在'
    };
    return;
  }

  const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];

  if (!cancellableStatuses.includes(order.status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '当前订单状态不允许取消'
    };
    return;
  }

  await order.update({ status: OrderStatus.CANCELLED });

  const waybill = await Waybill.findOne({ where: { orderId: order.id } });
  if (waybill) {
    await TrackingRecord.create({
      waybillId: waybill.id,
      event: TrackingEvent.ORDER_CREATED,
      eventTime: new Date(),
      operatorId: userId,
      description: '订单已取消'
    });
  }

  ctx.body = {
    success: true,
    message: '订单取消成功'
  };
};
