import Router from '@koa/router';
import { dataStore } from '../data/store';
import { Budget } from '../types';
import { z } from 'zod';

const router = new Router({ prefix: '/api/budgets' });

const createBudgetSchema = z.object({
  departmentId: z.string(),
  departmentName: z.string(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  totalAmount: z.number().min(0)
});

const updateBudgetSchema = z.object({
  totalAmount: z.number().min(0).optional(),
  locked: z.boolean().optional()
});

router.get('/', async (ctx) => {
  const { departmentId, year, month } = ctx.query;
  
  let budgets = dataStore.getBudgets();
  
  if (departmentId) {
    budgets = budgets.filter(b => b.departmentId === departmentId);
  }
  if (year) {
    budgets = budgets.filter(b => b.year === parseInt(year as string));
  }
  if (month) {
    budgets = budgets.filter(b => b.month === parseInt(month as string));
  }
  
  ctx.body = {
    success: true,
    data: budgets
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const budget = dataStore.getBudgetById(id);
  
  if (!budget) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '预算不存在'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: budget
  };
});

router.post('/', async (ctx) => {
  const parseResult = createBudgetSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const { departmentId, year, month } = parseResult.data;
  
  const existingBudget = dataStore.getBudgetByDepartment(departmentId, year, month);
  
  if (existingBudget) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该部门该月份的预算已存在'
    };
    return;
  }
  
  const budget = dataStore.createBudget({
    ...parseResult.data,
    usedAmount: 0,
    locked: false
  });
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: budget
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const parseResult = updateBudgetSchema.safeParse(ctx.request.body);
  
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: parseResult.error.issues
    };
    return;
  }
  
  const budget = dataStore.getBudgetById(id);
  
  if (!budget) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '预算不存在'
    };
    return;
  }
  
  const updates: Partial<Budget> = {};
  
  if (parseResult.data.totalAmount !== undefined) {
    if (parseResult.data.totalAmount < budget.usedAmount) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '预算总额不能小于已使用金额'
      };
      return;
    }
    updates.totalAmount = parseResult.data.totalAmount;
  }
  
  if (parseResult.data.locked !== undefined) {
    updates.locked = parseResult.data.locked;
    updates.lockedAt = parseResult.data.locked ? new Date().toISOString() : undefined;
  }
  
  const updatedBudget = dataStore.updateBudget(id, updates);
  
  ctx.body = {
    success: true,
    data: updatedBudget
  };
});

router.get('/:departmentId/:year/:month', async (ctx) => {
  const { departmentId, year, month } = ctx.params;
  
  const budget = dataStore.getBudgetByDepartment(
    departmentId,
    parseInt(year),
    parseInt(month)
  );
  
  if (!budget) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '预算不存在'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: budget
  };
});

router.get('/analysis/:year/:month', async (ctx) => {
  const { year, month } = ctx.params;
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  const budgets = dataStore.getBudgets().filter(
    b => b.year === yearNum && b.month === monthNum
  );
  
  const departments = dataStore.getDepartments();
  
  const analysis = departments.map(dept => {
    const budget = budgets.find(b => b.departmentId === dept.id);
    
    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalBudget: budget?.totalAmount || 0,
      usedAmount: budget?.usedAmount || 0,
      remainingAmount: (budget?.totalAmount || 0) - (budget?.usedAmount || 0),
      usageRate: budget?.totalAmount 
        ? Math.round((budget.usedAmount / budget.totalAmount) * 100) 
        : 0,
      locked: budget?.locked || false
    };
  });
  
  const totalBudget = analysis.reduce((sum, a) => sum + a.totalBudget, 0);
  const totalUsed = analysis.reduce((sum, a) => sum + a.usedAmount, 0);
  
  ctx.body = {
    success: true,
    data: {
      year: yearNum,
      month: monthNum,
      totalBudget,
      totalUsed,
      totalRemaining: totalBudget - totalUsed,
      overallUsageRate: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
      departments: analysis
    }
  };
});

export default router;
