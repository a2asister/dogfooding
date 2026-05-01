import Router from 'koa-router';
import { ContractStore } from '../store/ContractStore';

const router = new Router();

router.get('/', async (ctx) => {
  const archives = ContractStore.getAllArchives();
  const keyword = ctx.query.keyword as string;
  
  let filtered = archives;
  
  if (keyword) {
    filtered = ContractStore.searchArchives(keyword);
  }
  
  ctx.body = {
    success: true,
    data: filtered
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const archive = ContractStore.getArchiveById(id);
  
  if (archive) {
    const contract = ContractStore.getContractById(archive.contractId);
    ctx.body = {
      success: true,
      data: {
        archive,
        contract
      }
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '归档记录不存在'
    };
  }
});

router.get('/search', async (ctx) => {
  const keyword = ctx.query.keyword as string;
  
  if (!keyword) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '请提供搜索关键词'
    };
    return;
  }
  
  const results = ContractStore.searchArchives(keyword);
  
  const detailedResults = results.map(archive => {
    const contract = ContractStore.getContractById(archive.contractId);
    return {
      archive,
      contract
    };
  });
  
  ctx.body = {
    success: true,
    data: detailedResults,
    count: detailedResults.length,
    keyword
  };
});

export default router;
