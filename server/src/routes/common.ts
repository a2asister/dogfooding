import Router from '@koa/router';
import { dataStore } from '../data/store';

const router = new Router({ prefix: '/api' });

router.get('/departments', async (ctx) => {
  const departments = dataStore.getDepartments();
  
  ctx.body = {
    success: true,
    data: departments
  };
});

router.get('/users', async (ctx) => {
  const { departmentId, role } = ctx.query;
  
  let users = dataStore.getUsers();
  
  if (departmentId) {
    users = users.filter(u => u.departmentId === departmentId);
  }
  if (role) {
    users = users.filter(u => u.role === role);
  }
  
  ctx.body = {
    success: true,
    data: users
  };
});

router.get('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  const users = dataStore.getUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: user
  };
});

router.get('/stats', async (ctx) => {
  const { year, month } = ctx.query;
  const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
  const monthNum = month ? parseInt(month as string) : new Date().getMonth() + 1;
  
  const budgets = dataStore.getBudgets().filter(
    b => b.year === yearNum && b.month === monthNum
  );
  
  const applications = dataStore.getApplications();
  const currentMonthApps = applications.filter(a => {
    const appDate = new Date(a.createdAt);
    return appDate.getFullYear() === yearNum && appDate.getMonth() + 1 === monthNum;
  });
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);
  
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = currentMonthApps.filter(a => a.status === 'approved').length;
  const rejectedCount = currentMonthApps.filter(a => a.status === 'rejected').length;
  const draftCount = applications.filter(a => a.status === 'draft').length;
  
  const lockedBudgets = budgets.filter(b => b.locked).length;
  
  ctx.body = {
    success: true,
    data: {
      year: yearNum,
      month: monthNum,
      budget: {
        total: totalBudget,
        used: totalUsed,
        remaining: totalBudget - totalUsed,
        usageRate: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
        locked: lockedBudgets,
        totalDepartments: budgets.length
      },
      applications: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        draft: draftCount,
        totalThisMonth: currentMonthApps.length
      }
    }
  };
});

export default router;
