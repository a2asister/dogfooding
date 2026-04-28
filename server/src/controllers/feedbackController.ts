import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  Feedback, 
  FeedbackType, 
  FeedbackStatus,
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

export const getFeedbacks = async (ctx: AuthContext) => {
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
      { customerName: { [Op.like]: `%${keyword}%` } },
      { customerPhone: { [Op.like]: `%${keyword}%` } },
      { subject: { [Op.like]: `%${keyword}%` } },
      { content: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Feedback.findAndCountAll({
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
        as: 'assignee',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'responder',
        attributes: ['id', 'username', 'name'],
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

export const getFeedbackById = async (ctx: Context) => {
  const { id } = ctx.params;

  const feedback = await Feedback.findByPk(id, {
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
        as: 'assignee',
        attributes: ['id', 'username', 'name'],
        required: false
      },
      {
        model: User,
        as: 'responder',
        attributes: ['id', 'username', 'name'],
        required: false
      }
    ]
  });

  if (!feedback) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '反馈记录不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: feedback
  };
};

export const createFeedback = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const feedbackData = ctx.request.body as Partial<Feedback>;

  const requiredFields = ['type', 'customerName', 'customerPhone', 'subject', 'content'];

  const missingFields = requiredFields.filter((field) => !feedbackData[field as keyof typeof feedbackData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const feedback = await Feedback.create({
    orderId: feedbackData.orderId,
    waybillId: feedbackData.waybillId,
    type: (feedbackData.type as FeedbackType) || FeedbackType.OTHER,
    status: FeedbackStatus.PENDING,
    customerName: feedbackData.customerName as string,
    customerPhone: feedbackData.customerPhone as string,
    customerEmail: feedbackData.customerEmail,
    subject: feedbackData.subject as string,
    content: feedbackData.content as string,
    attachmentUrls: feedbackData.attachmentUrls,
    submittedAt: new Date(),
    assignedTo: feedbackData.assignedTo
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '反馈提交成功',
    data: feedback
  };
};

export const assignFeedback = async (ctx: AuthContext) => {
  const { id } = ctx.params;
  const { assignedTo } = ctx.request.body as { assignedTo: number };

  const feedback = await Feedback.findByPk(id);

  if (!feedback) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '反馈记录不存在'
    };
    return;
  }

  if (assignedTo) {
    const user = await User.findByPk(assignedTo);
    if (!user) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '处理人不存在'
      };
      return;
    }
  }

  const updateData: any = {
    assignedTo,
    status: assignedTo ? FeedbackStatus.PROCESSING : FeedbackStatus.PENDING
  };

  if (assignedTo) {
    updateData.assignedAt = new Date();
  }

  await feedback.update(updateData);

  ctx.body = {
    success: true,
    message: assignedTo ? '分配成功' : '已取消分配',
    data: feedback
  };
};

export const respondFeedback = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { responseContent, satisfaction } = ctx.request.body as { 
    responseContent: string;
    satisfaction?: number;
  };

  if (!responseContent) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '请填写回复内容'
    };
    return;
  }

  const feedback = await Feedback.findByPk(id);

  if (!feedback) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '反馈记录不存在'
    };
    return;
  }

  const updateData: any = {
    responseContent,
    responseAt: new Date(),
    responseBy: userId
  };

  if (satisfaction !== undefined) {
    updateData.satisfaction = satisfaction;
  }

  if (satisfaction !== undefined || feedback.status === FeedbackStatus.PROCESSING) {
    updateData.status = FeedbackStatus.RESOLVED;
  }

  await feedback.update(updateData);

  ctx.body = {
    success: true,
    message: '回复成功',
    data: feedback
  };
};

export const closeFeedback = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;

  const feedback = await Feedback.findByPk(id);

  if (!feedback) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '反馈记录不存在'
    };
    return;
  }

  await feedback.update({
    status: FeedbackStatus.CLOSED,
    closedAt: new Date(),
    closedBy: userId
  });

  ctx.body = {
    success: true,
    message: '已关闭',
    data: feedback
  };
};
