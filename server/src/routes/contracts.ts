import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import { ContractStore } from '../store/ContractStore';
import { Contract, ContractStatus } from '../types';

const router = new Router();

router.get('/', async (ctx) => {
  const contracts = ContractStore.getAllContracts();
  const status = ctx.query.status as ContractStatus;
  const search = ctx.query.search as string;
  
  let filtered = contracts;
  
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  
  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter(c => 
      c.title.toLowerCase().includes(lowerSearch) ||
      c.partyA.toLowerCase().includes(lowerSearch) ||
      c.partyB.toLowerCase().includes(lowerSearch)
    );
  }
  
  ctx.body = {
    success: true,
    data: filtered
  };
});

router.get('/expiring', async (ctx) => {
  const days = parseInt(ctx.query.days as string) || 30;
  const expiring = ContractStore.getExpiringContracts(days);
  
  ctx.body = {
    success: true,
    data: expiring,
    count: expiring.length
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const contract = ContractStore.getContractById(id);
  
  if (contract) {
    ctx.body = {
      success: true,
      data: contract
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
  }
});

router.post('/', async (ctx) => {
  const body = ctx.request.body as Partial<Contract>;
  
  const newContract: Contract = {
    id: uuidv4(),
    title: body.title || '未命名合同',
    type: body.type || 'general',
    content: body.content || '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: body.startDate || new Date().toISOString(),
    endDate: body.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    partyA: body.partyA || '',
    partyB: body.partyB || '',
    amount: body.amount || 0,
    signatures: [],
    approvalHistory: []
  };
  
  const created = ContractStore.createContract(newContract);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: created,
    message: '合同创建成功'
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const body = ctx.request.body as Partial<Contract>;
  
  const updated = ContractStore.updateContract(id, body);
  
  if (updated) {
    ctx.body = {
      success: true,
      data: updated,
      message: '合同更新成功'
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
  }
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const deleted = ContractStore.deleteContract(id);
  
  if (deleted) {
    ctx.body = {
      success: true,
      message: '合同删除成功'
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
  }
});

router.post('/:id/submit-approval', async (ctx) => {
  const { id } = ctx.params;
  const { approver } = ctx.request.body as { approver: string };
  
  const contract = ContractStore.getContractById(id);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'draft') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只有草稿状态的合同可以提交审批'
    };
    return;
  }
  
  const updated = ContractStore.updateContract(id, {
    status: 'pending_approval',
    currentApprover: approver,
    approvalHistory: [
      ...contract.approvalHistory,
      {
        id: uuidv4(),
        approver,
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ]
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: '合同已提交审批'
  };
});

router.post('/:id/sign', async (ctx) => {
  const { id } = ctx.params;
  const { party, signerName, signatureImage } = ctx.request.body as {
    party: string;
    signerName: string;
    signatureImage?: string;
  };
  
  const contract = ContractStore.getContractById(id);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'pending_signature' && contract.status !== 'approved') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只有已审批的合同可以签章'
    };
    return;
  }
  
  const newSignature = {
    id: uuidv4(),
    party,
    signerName,
    signatureDate: new Date().toISOString(),
    signatureImage
  };
  
  const updatedSignatures = [...contract.signatures, newSignature];
  const isFullySigned = updatedSignatures.length >= 2;
  
  const updated = ContractStore.updateContract(id, {
    status: isFullySigned ? 'signed' : 'pending_signature',
    signatures: updatedSignatures
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: isFullySigned ? '合同签署完成' : '签章成功，等待其他方签署'
  };
});

router.post('/:id/start-performance', async (ctx) => {
  const { id } = ctx.params;
  
  const contract = ContractStore.getContractById(id);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'signed') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只有已签署的合同可以开始履约'
    };
    return;
  }
  
  const updated = ContractStore.updateContract(id, {
    status: 'performance'
  });
  
  ctx.body = {
    success: true,
    data: updated,
    message: '合同已进入履约阶段'
  };
});

router.post('/:id/archive', async (ctx) => {
  const { id } = ctx.params;
  const { keywords, accessLevel, archiveBy } = ctx.request.body as {
    keywords: string[];
    accessLevel: 'public' | 'internal' | 'confidential';
    archiveBy: string;
  };
  
  const contract = ContractStore.getContractById(id);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  if (contract.status !== 'expired' && contract.status !== 'terminated') {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '只有已过期或终止的合同可以归档'
    };
    return;
  }
  
  const archiveId = uuidv4();
  const archive = ContractStore.createArchive({
    id: archiveId,
    contractId: id,
    archiveDate: new Date().toISOString(),
    location: `archives/${archiveId}`,
    keywords: keywords || [contract.title, contract.type],
    accessLevel: accessLevel || 'internal',
    archiveBy
  });
  
  const updated = ContractStore.updateContract(id, {
    status: 'archived',
    archiveId
  });
  
  ctx.body = {
    success: true,
    data: {
      contract: updated,
      archive
    },
    message: '合同归档成功'
  };
});

export default router;
