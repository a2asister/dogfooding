import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import { ContractStore } from '../store/ContractStore';
import { PerformanceRecord } from '../types';

const router = new Router();

router.get('/', async (ctx) => {
  const contractId = ctx.query.contractId as string;
  let records;
  
  if (contractId) {
    records = ContractStore.getPerformanceByContractId(contractId);
  } else {
    records = ContractStore.getAllPerformance();
  }
  
  ctx.body = {
    success: true,
    data: records
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const records = ContractStore.getAllPerformance();
  const record = records.find(r => r.id === id);
  
  if (record) {
    ctx.body = {
      success: true,
      data: record
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '履约记录不存在'
    };
  }
});

router.post('/', async (ctx) => {
  const body = ctx.request.body as Partial<PerformanceRecord>;
  
  const contract = ContractStore.getContractById(body.contractId || '');
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'performance') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只有履约中的合同可以添加履约记录'
    };
    return;
  }
  
  const newRecord: PerformanceRecord = {
    id: uuidv4(),
    contractId: body.contractId || '',
    type: body.type || 'milestone',
    description: body.description || '',
    amount: body.amount,
    dueDate: body.dueDate || new Date().toISOString(),
    status: 'pending',
    notes: body.notes
  };
  
  const created = ContractStore.createPerformance(newRecord);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: created,
    message: '履约记录创建成功'
  };
});

router.put('/:id/complete', async (ctx) => {
  const { id } = ctx.params;
  const { notes } = ctx.request.body as { notes?: string };
  
  const records = ContractStore.getAllPerformance();
  const record = records.find(r => r.id === id);
  
  if (!record) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '履约记录不存在'
    };
    return;
  }
  
  const updated = ContractStore.updatePerformance(id, {
    status: 'completed',
    completedDate: new Date().toISOString(),
    notes: notes || record.notes
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: '履约记录已标记为完成'
  };
});

router.put('/:id/cancel', async (ctx) => {
  const { id } = ctx.params;
  const { notes } = ctx.request.body as { notes?: string };
  
  const records = ContractStore.getAllPerformance();
  const record = records.find(r => r.id === id);
  
  if (!record) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '履约记录不存在'
    };
    return;
  }
  
  const updated = ContractStore.updatePerformance(id, {
    status: 'cancelled',
    notes: notes || record.notes
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: '履约记录已取消'
  };
});

router.get('/contract/:contractId', async (ctx) => {
  const { contractId } = ctx.params;
  const records = ContractStore.getPerformanceByContractId(contractId);
  
  ctx.body = {
    success: true,
    data: records
  };
});

router.get('/overdue', async (ctx) => {
  const records = ContractStore.getAllPerformance();
  const now = new Date();
  
  const overdue = records.filter(r => {
    if (r.status !== 'pending') return false;
    const dueDate = new Date(r.dueDate);
    return dueDate < now;
  });
  
  ctx.body = {
    success: true,
    data: overdue,
    count: overdue.length
  };
});

export default router;
