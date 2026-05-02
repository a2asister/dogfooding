import Router from '@koa/router';
import { dataStore } from '../data/store';
import { ExpenseApplication, ApplicationStatus, ExpenseItem, ExpenseCategory } from '../types';
import { z } from 'zod';

const router = new Router({ prefix: '/api/applications' });

const expenseItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum([
    '办公费', '差旅费', '业务招待费', '培训费', 
    '会议费', '通讯费', '交通费', '福利费', '其他'
  ]),
  description: z.string().min(1).max(200),
  amount: z.number().min(0),
  receiptImage: z.string().optional(),
  receiptData: z.object({
    merchantName: z.string(),
    date: z.string(),
    amount: z.number(),
    taxNo: z.string().optional(),
    items: z.array(z.string()).optional(),
    confidence: z.number()
  }).optional()
});

const createApplicationSchema = z.object({
  title: z.string().min(1).max(100),
  applicantId: z.string(),
  applicantName: z.string(),
  departmentId: z.string(),
  departmentName: z.string(),
  description: z.string().max(500).optional(),
  items: z.array(expenseItemSchema).min(1)
});

const updateApplicationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  items: z.array(expenseItemSchema).min(1).optional()
});

const approvalSchema = z.object({
  approverId: z.string().optional(),
  approverName: z.string().optional(),
  approvalComment: z.string().max(500).optional(),
  comment: z.string().max(500).optional()
});

router.get('/', async (ctx) => {
  const { 
    departmentId, 
    applicantId, 
    status,
    page = '1',
    pageSize = '20'
  } = ctx.query;
  
  let applications = dataStore.getApplications();
  
  if (departmentId) {
    applications = applications.filter(a => a.departmentId === departmentId);
  }
  if (applicantId) {
    applications = applications.filter(a => a.applicantId === applicantId);
  }
  if (status) {
    applications = applications.filter(a => a.status === status);
  }
  
  applications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const pageNum = parseInt(page as string);
  const sizeNum = parseInt(pageSize as string);
  const start = (pageNum - 1) * sizeNum;
  const end = start + sizeNum;
  const paginated = applications.slice(start, end);
  
  ctx.body = {
    success: true,
    data: {
      items: paginated,
      total: applications.length,
      page: pageNum,
      pageSize: sizeNum,
      totalPages: Math.ceil(applications.length / sizeNum)
    }
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: application
  };
});

router.post('/', async (ctx) => {
  const parseResult = createApplicationSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const { items, ...rest } = parseResult.data;
  
  const itemsWithIds: ExpenseItem[] = items.map(item => ({
    ...item,
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));
  
  const totalAmount = itemsWithIds.reduce((sum, item) => sum + item.amount, 0);
  
  const application = dataStore.createApplication({
    ...rest,
    status: 'draft',
    items: itemsWithIds,
    totalAmount
  });
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: application
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const parseResult = updateApplicationSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  if (application.status !== 'draft') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只能编辑草稿状态的申请'
    };
    return;
  }
  
  const updates: Partial<ExpenseApplication> = {};
  
  if (parseResult.data.title) updates.title = parseResult.data.title;
  if (parseResult.data.description !== undefined) updates.description = parseResult.data.description;
  
  if (parseResult.data.items) {
    const itemsWithIds: ExpenseItem[] = parseResult.data.items.map(item => ({
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    updates.items = itemsWithIds;
    updates.totalAmount = itemsWithIds.reduce((sum, item) => sum + item.amount, 0);
  }
  
  const updatedApplication = dataStore.updateApplication(id, updates);
  
  ctx.body = {
    success: true,
    data: updatedApplication
  };
});

router.post('/:id/submit', async (ctx) => {
  const { id } = ctx.params;
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  if (application.status !== 'draft') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只能提交草稿状态的申请'
    };
    return;
  }
  
  const budget = dataStore.getBudgetByDepartment(
    application.departmentId,
    new Date().getFullYear(),
    new Date().getMonth() + 1
  );
  
  if (budget && budget.locked) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该部门本月预算已锁定，无法提交申请'
    };
    return;
  }
  
  if (budget && (budget.totalAmount - budget.usedAmount) < application.totalAmount) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '预算余额不足，请调整申请金额'
    };
    return;
  }
  
  const updatedApplication = dataStore.updateApplication(id, {
    status: 'pending',
    submittedAt: new Date().toISOString()
  });
  
  ctx.body = {
    success: true,
    data: updatedApplication
  };
});

router.post('/:id/approve', async (ctx) => {
  const { id } = ctx.params;
  const parseResult = approvalSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  if (application.status !== 'pending') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只能审批待审核状态的申请'
    };
    return;
  }
  
  const budget = dataStore.getBudgetByDepartment(
    application.departmentId,
    new Date().getFullYear(),
    new Date().getMonth() + 1
  );
  
  if (budget && budget.locked) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该部门本月预算已锁定，无法审批通过'
    };
    return;
  }
  
  if (budget) {
    dataStore.updateBudget(budget.id, {
      usedAmount: budget.usedAmount + application.totalAmount
    });
  }
  
  const updatedApplication = dataStore.updateApplication(id, {
    status: 'approved',
    approverId: parseResult.data.approverId || 'default-approver',
    approverName: parseResult.data.approverName || '系统审批',
    approvalComment: parseResult.data.approvalComment || parseResult.data.comment || '',
    approvedAt: new Date().toISOString()
  });
  
  ctx.body = {
    success: true,
    data: updatedApplication
  };
});

router.post('/:id/reject', async (ctx) => {
  const { id } = ctx.params;
  const parseResult = approvalSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  if (application.status !== 'pending') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只能拒绝待审核状态的申请'
    };
    return;
  }
  
  const updatedApplication = dataStore.updateApplication(id, {
    status: 'rejected',
    approverId: parseResult.data.approverId || 'default-approver',
    approverName: parseResult.data.approverName || '系统审批',
    approvalComment: parseResult.data.approvalComment || parseResult.data.comment || '',
    approvedAt: new Date().toISOString()
  });
  
  ctx.body = {
    success: true,
    data: updatedApplication
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const application = dataStore.getApplicationById(id);
  
  if (!application) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '申请不存在'
    };
    return;
  }
  
  if (application.status !== 'draft') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只能删除草稿状态的申请'
    };
    return;
  }
  
  const applications = dataStore.getApplications().filter(a => a.id !== id);
  dataStore.saveApplications(applications);
  
  ctx.body = {
    success: true,
    message: '申请已删除'
  };
});

export default router;
