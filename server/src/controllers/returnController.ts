import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  Return, 
  ReturnType, 
  ReturnStatus,
  Claim,
  ClaimType,
  ClaimStatus,
  Order,
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

export const getReturns = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, type, keyword } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (keyword) {
    where[Op.or] = [
      { returnWaybillNo: { [Op.like]: `%${keyword}%` } },
      { requestReason: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Return.findAndCountAll({
    where,
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNo', 'status'],
        required: false
      },
      {
        model: Waybill,
        as: 'waybill',
        attributes: ['id', 'waybillNo', 'status'],
        required: false
      },
      {
        model: User,
        as: 'requester',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['requestedAt', 'DESC']]
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

export const getReturnById = async (ctx: Context) => {
  const { id } = ctx.params;

  const returnItem = await Return.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'order',
        required: false
      },
      {
        model: Waybill,
        as: 'waybill',
        required: false
      },
      {
        model: User,
        as: 'requester',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'processor',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ]
  });

  if (!returnItem) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '退换货记录不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: returnItem
  };
};

export const createReturn = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const returnData = ctx.request.body as Partial<Return>;

  const requiredFields = ['orderId', 'type', 'requestReason'];

  const missingFields = requiredFields.filter((field) => !returnData[field as keyof typeof returnData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const returnItem = await Return.create({
    orderId: returnData.orderId as number,
    waybillId: returnData.waybillId,
    type: (returnData.type as ReturnType) || ReturnType.REFUND,
    status: ReturnStatus.REQUESTED,
    returnWaybillNo: returnData.returnWaybillNo,
    requestReason: returnData.requestReason as string,
    requestDescription: returnData.requestDescription,
    requestedAt: new Date(),
    requestedBy: userId
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '退换货申请创建成功',
    data: returnItem
  };
};

export const approveReturn = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { approvalComment, refundAmount } = ctx.request.body as { 
    approvalComment?: string;
    refundAmount?: number;
  };

  const returnItem = await Return.findByPk(id);

  if (!returnItem) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '退换货记录不存在'
    };
    return;
  }

  if (returnItem.status !== ReturnStatus.REQUESTED) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '当前状态不允许审批'
    };
    return;
  }

  await returnItem.update({
    status: ReturnStatus.APPROVED,
    approvedAt: new Date(),
    approvedBy: userId,
    approvalComment,
    refundAmount
  });

  ctx.body = {
    success: true,
    message: '审批通过',
    data: returnItem
  };
};

export const rejectReturn = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { approvalComment } = ctx.request.body as { approvalComment?: string };

  const returnItem = await Return.findByPk(id);

  if (!returnItem) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '退换货记录不存在'
    };
    return;
  }

  if (returnItem.status !== ReturnStatus.REQUESTED) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '当前状态不允许操作'
    };
    return;
  }

  await returnItem.update({
    status: ReturnStatus.REJECTED,
    approvedAt: new Date(),
    approvedBy: userId,
    approvalComment
  });

  ctx.body = {
    success: true,
    message: '已拒绝申请',
    data: returnItem
  };
};

export const updateReturnStatus = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { status } = ctx.request.body as { status: ReturnStatus };

  if (!Object.values(ReturnStatus).includes(status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无效的状态值'
    };
    return;
  }

  const returnItem = await Return.findByPk(id);

  if (!returnItem) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '退换货记录不存在'
    };
    return;
  }

  const updateData: any = { status };

  if (status === ReturnStatus.RECEIVED) {
    updateData.receivedAt = new Date();
    updateData.receivedBy = userId;
  } else if (status === ReturnStatus.PROCESSED) {
    updateData.processedAt = new Date();
    updateData.processedBy = userId;
  } else if (status === ReturnStatus.COMPLETED) {
    updateData.processedAt = new Date();
    updateData.processedBy = userId;
  }

  await returnItem.update(updateData);

  ctx.body = {
    success: true,
    message: '状态更新成功',
    data: returnItem
  };
};

export const getClaims = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, type, keyword } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (keyword) {
    where[Op.or] = [
      { claimantName: { [Op.like]: `%${keyword}%` } },
      { claimantPhone: { [Op.like]: `%${keyword}%` } },
      { claimReason: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Claim.findAndCountAll({
    where,
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNo'],
        required: false
      },
      {
        model: Waybill,
        as: 'waybill',
        attributes: ['id', 'waybillNo'],
        required: false
      },
      {
        model: User,
        as: 'submitter',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['submittedAt', 'DESC']]
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

export const getClaimById = async (ctx: Context) => {
  const { id } = ctx.params;

  const claim = await Claim.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'order',
        required: false
      },
      {
        model: Waybill,
        as: 'waybill',
        required: false
      },
      {
        model: User,
        as: 'submitter',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ]
  });

  if (!claim) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '理赔记录不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: claim
  };
};

export const createClaim = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const claimData = ctx.request.body as Partial<Claim>;

  const requiredFields = ['type', 'claimantName', 'claimantPhone', 'claimAmount', 'claimReason'];

  const missingFields = requiredFields.filter((field) => !claimData[field as keyof typeof claimData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const claim = await Claim.create({
    orderId: claimData.orderId,
    waybillId: claimData.waybillId,
    exceptionItemId: claimData.exceptionItemId,
    type: (claimData.type as ClaimType) || ClaimType.OTHER,
    status: ClaimStatus.PENDING,
    claimantName: claimData.claimantName as string,
    claimantPhone: claimData.claimantPhone as string,
    claimantEmail: claimData.claimantEmail,
    claimAmount: claimData.claimAmount as number,
    claimReason: claimData.claimReason as string,
    claimDescription: claimData.claimDescription,
    evidenceUrls: claimData.evidenceUrls,
    submittedAt: new Date(),
    submittedBy: userId
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '理赔申请创建成功',
    data: claim
  };
};

export const updateClaim = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<Claim>;

  const claim = await Claim.findByPk(id);

  if (!claim) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '理赔记录不存在'
    };
    return;
  }

  const allowedFields: any = {};
  if (updateData.assignedTo !== undefined) {
    allowedFields.assignedTo = updateData.assignedTo;
    allowedFields.assignedAt = new Date();
  }
  if (updateData.reviewComment !== undefined) {
    allowedFields.reviewComment = updateData.reviewComment;
  }
  if (updateData.approvedAmount !== undefined) {
    allowedFields.approvedAmount = updateData.approvedAmount;
  }
  if (updateData.status !== undefined && Object.values(ClaimStatus).includes(updateData.status)) {
    allowedFields.status = updateData.status;
    if (updateData.status === ClaimStatus.REVIEWING || 
        updateData.status === ClaimStatus.APPROVED || 
        updateData.status === ClaimStatus.REJECTED) {
      allowedFields.reviewedAt = new Date();
      allowedFields.reviewedBy = userId;
    }
    if (updateData.status === ClaimStatus.PAID) {
      allowedFields.paidAt = new Date();
      allowedFields.paidBy = userId;
    }
    if (updateData.status === ClaimStatus.CLOSED) {
      allowedFields.closedAt = new Date();
      allowedFields.closedBy = userId;
    }
  }

  await claim.update(allowedFields);

  ctx.body = {
    success: true,
    message: '更新成功',
    data: claim
  };
};
