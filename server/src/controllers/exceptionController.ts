import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  ExceptionItem, 
  ExceptionType, 
  ExceptionStatus, 
  ExceptionPriority,
  Waybill,
  User
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

export const getExceptions = async (ctx: AuthContext) => {
  const { 
    page = 1, 
    pageSize = 10, 
    status, 
    type, 
    priority,
    keyword 
  } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (priority) {
    where.priority = priority;
  }

  if (keyword) {
    where[Op.or] = [
      { description: { [Op.like]: `%${keyword}%` } },
      { location: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await ExceptionItem.findAndCountAll({
    where,
    include: [
      {
        model: Waybill,
        as: 'waybill',
        attributes: ['id', 'waybillNo', 'status'],
        required: false
      },
      {
        model: User,
        as: 'detector',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'responsiblePerson',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'resolver',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['priority', 'DESC'], ['detectedAt', 'DESC']]
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

export const getExceptionById = async (ctx: Context) => {
  const { id } = ctx.params;

  const exception = await ExceptionItem.findByPk(id, {
    include: [
      {
        model: Waybill,
        as: 'waybill',
        required: false
      },
      {
        model: User,
        as: 'detector',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'responsiblePerson',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'resolver',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ]
  });

  if (!exception) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '异常件不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: exception
  };
};

export const createException = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const exceptionData = ctx.request.body as Partial<ExceptionItem>;

  const requiredFields = ['waybillId', 'type', 'description'];

  const missingFields = requiredFields.filter((field) => !exceptionData[field as keyof typeof exceptionData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const exception = await ExceptionItem.create({
    waybillId: exceptionData.waybillId as number,
    type: (exceptionData.type as ExceptionType) || ExceptionType.OTHER,
    status: ExceptionStatus.PENDING,
    priority: (exceptionData.priority as ExceptionPriority) || ExceptionPriority.MEDIUM,
    detectedAt: new Date(),
    detectedBy: userId,
    location: exceptionData.location,
    description: exceptionData.description as string,
    damageDescription: exceptionData.damageDescription,
    estimatedLoss: exceptionData.estimatedLoss,
    responsiblePersonId: exceptionData.responsiblePersonId,
    responsiblePersonName: exceptionData.responsiblePersonName,
    remark: exceptionData.remark
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '异常件登记成功',
    data: exception
  };
};

export const updateException = async (ctx: Context) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<ExceptionItem>;

  const exception = await ExceptionItem.findByPk(id);

  if (!exception) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '异常件不存在'
    };
    return;
  }

  const nonUpdatableStatuses = [ExceptionStatus.RESOLVED, ExceptionStatus.CLOSED];
  if (nonUpdatableStatuses.includes(exception.status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '当前状态不允许修改'
    };
    return;
  }

  const { waybillId, detectedAt, detectedBy, resolvedAt, resolvedBy, ...allowedFields } = updateData;

  await exception.update(allowedFields);

  ctx.body = {
    success: true,
    message: '更新成功',
    data: exception
  };
};

export const updateExceptionStatus = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { status, resolutionSteps, resolutionCost } = ctx.request.body as { 
    status: ExceptionStatus;
    resolutionSteps?: string;
    resolutionCost?: number;
  };

  if (!Object.values(ExceptionStatus).includes(status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无效的状态值'
    };
    return;
  }

  const exception = await ExceptionItem.findByPk(id);

  if (!exception) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '异常件不存在'
    };
    return;
  }

  const updateData: any = { status };

  if (status === ExceptionStatus.RESOLVED) {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = userId;
    if (resolutionSteps) updateData.resolutionSteps = resolutionSteps;
    if (resolutionCost !== undefined) updateData.resolutionCost = resolutionCost;
  }

  await exception.update(updateData);

  ctx.body = {
    success: true,
    message: '状态更新成功',
    data: exception
  };
};

export const assignResponsiblePerson = async (ctx: Context) => {
  const { id } = ctx.params;
  const { responsiblePersonId, responsiblePersonName } = ctx.request.body as { 
    responsiblePersonId?: number;
    responsiblePersonName?: string;
  };

  const exception = await ExceptionItem.findByPk(id);

  if (!exception) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '异常件不存在'
    };
    return;
  }

  await exception.update({ responsiblePersonId, responsiblePersonName });

  ctx.body = {
    success: true,
    message: '责任人分配成功',
    data: exception
  };
};
