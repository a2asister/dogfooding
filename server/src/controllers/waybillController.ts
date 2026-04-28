import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  Waybill, 
  WaybillStatus,
  TrackingRecord,
  TrackingEvent,
  Order,
  Branch,
  User,
  Vehicle
} from '../models';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: string;
    };
  };
}

export const getWaybills = async (ctx: Context) => {
  const { page = 1, pageSize = 10, status, keyword, startDate, endDate, branchId } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (branchId) {
    where[Op.or] = [
      { currentBranchId: branchId },
      { nextBranchId: branchId }
    ];
  }

  const orderWhere: any = {};
  if (keyword) {
    orderWhere[Op.or] = [
      { orderNo: { [Op.like]: `%${keyword}%` } },
      { senderName: { [Op.like]: `%${keyword}%` } },
      { receiverName: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Waybill.findAndCountAll({
    where,
    include: [
      {
        model: Order,
        as: 'order',
        where: Object.keys(orderWhere).length > 0 ? orderWhere : undefined,
        required: true
      },
      {
        model: Branch,
        as: 'currentBranch',
        required: false
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'name', 'phone'],
        required: false
      },
      {
        model: Vehicle,
        as: 'vehicle',
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

export const getWaybillById = async (ctx: Context) => {
  const { id } = ctx.params;

  const waybill = await Waybill.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'order'
      },
      {
        model: TrackingRecord,
        as: 'trackingRecords',
        order: [['eventTime', 'DESC']],
        include: [
          {
            model: User,
            as: 'operator',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: Branch,
            as: 'branch',
            required: false
          }
        ]
      },
      {
        model: Branch,
        as: 'currentBranch',
        required: false
      },
      {
        model: Branch,
        as: 'nextBranch',
        required: false
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'name', 'phone'],
        required: false
      },
      {
        model: Vehicle,
        as: 'vehicle',
        required: false
      }
    ]
  });

  if (!waybill) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '运单不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: waybill
  };
};

export const getWaybillByNo = async (ctx: Context) => {
  const { waybillNo } = ctx.params;

  const waybill = await Waybill.findOne({
    where: { waybillNo },
    include: [
      {
        model: Order,
        as: 'order'
      },
      {
        model: TrackingRecord,
        as: 'trackingRecords',
        order: [['eventTime', 'DESC']]
      }
    ]
  });

  if (!waybill) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '运单不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: waybill
  };
};

export const updateWaybillStatus = async (ctx: AuthContext) => {
  const { id } = ctx.params;
  const { status, branchId, description } = ctx.request.body as {
    status: WaybillStatus;
    branchId?: number;
    description?: string;
  };

  const userId = ctx.state.user.userId;

  const waybill = await Waybill.findByPk(id);

  if (!waybill) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '运单不存在'
    };
    return;
  }

  const user = await User.findByPk(userId);

  const updateData: Partial<Waybill> = { status };
  
  if (branchId) {
    updateData.currentBranchId = branchId;
  }

  await waybill.update(updateData);

  let event: TrackingEvent;
  switch (status) {
    case WaybillStatus.PICKED_UP:
      event = TrackingEvent.PICKED_UP;
      break;
    case WaybillStatus.IN_TRANSIT:
      event = TrackingEvent.IN_TRANSIT;
      break;
    case WaybillStatus.ARRIVED:
      event = TrackingEvent.ARRIVED_AT_BRANCH;
      break;
    case WaybillStatus.DELIVERING:
      event = TrackingEvent.OUT_FOR_DELIVERY;
      break;
    case WaybillStatus.DELIVERED:
      event = TrackingEvent.DELIVERED;
      break;
    case WaybillStatus.SIGNED:
      event = TrackingEvent.SIGNED;
      break;
    default:
      event = TrackingEvent.ORDER_CREATED;
  }

  const branch = branchId ? await Branch.findByPk(branchId) : null;

  await TrackingRecord.create({
    waybillId: waybill.id,
    event,
    eventTime: new Date(),
    operatorId: userId,
    operatorName: user?.name,
    branchId,
    branchName: branch?.name,
    description: description || `运单状态已更新为: ${status}`
  });

  ctx.body = {
    success: true,
    message: '运单状态更新成功',
    data: waybill
  };
};

export const assignCourier = async (ctx: AuthContext) => {
  const { id } = ctx.params;
  const { courierId, vehicleId } = ctx.request.body as {
    courierId: number;
    vehicleId?: number;
  };

  const waybill = await Waybill.findByPk(id);

  if (!waybill) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '运单不存在'
    };
    return;
  }

  const courier = await User.findByPk(courierId);
  if (!courier) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '快递员不存在'
    };
    return;
  }

  const updateData: Partial<Waybill> = {
    courierId,
    status: WaybillStatus.IN_TRANSIT
  };

  if (vehicleId) {
    updateData.vehicleId = vehicleId;
  }

  await waybill.update(updateData);

  await TrackingRecord.create({
    waybillId: waybill.id,
    event: TrackingEvent.DISPATCHED,
    eventTime: new Date(),
    operatorId: ctx.state.user.userId,
    description: `已分配快递员: ${courier.name}`
  });

  ctx.body = {
    success: true,
    message: '快递员分配成功',
    data: waybill
  };
};
