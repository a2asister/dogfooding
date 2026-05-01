import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import { ContractStore } from '../store/ContractStore';
import type { ContractStatus } from '../types';

const router = new Router();

router.get('/', async (ctx) => {
  const contracts = ContractStore.getAllContracts();
  const pendingApprovals = contracts.filter(c => c.status === 'pending_approval');
  
  const approvals = pendingApprovals.map(contract => ({
    id: contract.id,
    contractTitle: contract.title,
    contractType: contract.type,
    currentApprover: contract.currentApprover,
    submittedAt: contract.approvalHistory[0]?.timestamp,
    partyA: contract.partyA,
    partyB: contract.partyB,
    amount: contract.amount
  }));
  
  ctx.body = {
    success: true,
    data: approvals
  };
});

router.get('/my', async (ctx) => {
  const approver = ctx.query.approver as string;
  const contracts = ContractStore.getAllContracts();
  
  const myApprovals = contracts.filter(c => 
    c.status === 'pending_approval' && c.currentApprover === approver
  );
  
  ctx.body = {
    success: true,
    data: myApprovals
  };
});

router.post('/:contractId/approve', async (ctx) => {
  const { contractId } = ctx.params;
  const { approver, comment, nextApprover } = ctx.request.body as {
    approver: string;
    comment?: string;
    nextApprover?: string;
  };
  
  const contract = ContractStore.getContractById(contractId);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'pending_approval') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该合同不在待审批状态'
    };
    return;
  }
  
  const updatedHistory = contract.approvalHistory.map(step => {
    if (step.status === 'pending' && step.approver === approver) {
      return {
        ...step,
        status: 'approved' as const,
        comment,
        timestamp: new Date().toISOString()
      };
    }
    return step;
  });
  
  let newStatus: ContractStatus = contract.status;
  let newCurrentApprover = contract.currentApprover;
  
  if (nextApprover) {
    updatedHistory.push({
      id: uuidv4(),
      approver: nextApprover,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    newCurrentApprover = nextApprover;
  } else {
    newStatus = 'approved';
    newCurrentApprover = undefined;
  }
  
  const updated = ContractStore.updateContract(contractId, {
    status: newStatus,
    currentApprover: newCurrentApprover,
    approvalHistory: updatedHistory
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: nextApprover ? '已审批，提交给下一级审批人' : '审批通过，合同已生效'
  };
});

router.post('/:contractId/reject', async (ctx) => {
  const { contractId } = ctx.params;
  const { approver, comment } = ctx.request.body as {
    approver: string;
    comment?: string;
  };
  
  const contract = ContractStore.getContractById(contractId);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'pending_approval') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该合同不在待审批状态'
    };
    return;
  }
  
  const updatedHistory = contract.approvalHistory.map(step => {
    if (step.status === 'pending' && step.approver === approver) {
      return {
        ...step,
        status: 'rejected' as const,
        comment,
        timestamp: new Date().toISOString()
      };
    }
    return step;
  });
  
  const updated = ContractStore.updateContract(contractId, {
    status: 'rejected',
    currentApprover: undefined,
    approvalHistory: updatedHistory
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: '合同已驳回'
  };
});

router.get('/history/:contractId', async (ctx) => {
  const { contractId } = ctx.params;
  const contract = ContractStore.getContractById(contractId);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: contract.approvalHistory
  };
});

export default router;
