const Router = require('@koa/router');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/data');

const router = new Router();

// 获取所有整改
router.get('/', async (ctx) => {
  const { riskId, status } = ctx.query;
  const data = await readData();
  
  let rectifications = data.rectifications;
  
  if (riskId) {
    rectifications = rectifications.filter(r => r.riskId === riskId);
  }
  
  if (status) {
    rectifications = rectifications.filter(r => r.status === status);
  }
  
  ctx.body = {
    code: 200,
    data: rectifications
  };
});

// 获取单个整改
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  const rectification = data.rectifications.find(r => r.id === id);
  
  if (!rectification) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '整改记录不存在'
    };
    return;
  }
  
  ctx.body = {
    code: 200,
    data: rectification
  };
});

// 创建整改
router.post('/', async (ctx) => {
  const rectificationData = ctx.request.body;
  const data = await readData();
  
  const newRectification = {
    id: uuidv4(),
    ...rectificationData,
    status: 'in_progress',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.rectifications.push(newRectification);
  
  // 更新风险状态
  const riskIndex = data.risks.findIndex(r => r.id === rectificationData.riskId);
  if (riskIndex !== -1) {
    data.risks[riskIndex].status = 'in_progress';
    data.risks[riskIndex].updatedAt = new Date().toISOString();
  }
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newRectification,
    message: '整改创建成功'
  };
});

// 更新整改
router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body;
  const data = await readData();
  
  const rectificationIndex = data.rectifications.findIndex(r => r.id === id);
  
  if (rectificationIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '整改记录不存在'
    };
    return;
  }
  
  data.rectifications[rectificationIndex] = {
    ...data.rectifications[rectificationIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  // 如果整改完成，更新风险状态
  if (updateData.status === 'completed' || updateData.progress === 100) {
    const riskIndex = data.risks.findIndex(r => r.id === data.rectifications[rectificationIndex].riskId);
    if (riskIndex !== -1) {
      data.risks[riskIndex].status = 'resolved';
      data.risks[riskIndex].updatedAt = new Date().toISOString();
    }
  }
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: data.rectifications[rectificationIndex],
    message: '整改更新成功'
  };
});

// 删除整改
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  
  const rectificationIndex = data.rectifications.findIndex(r => r.id === id);
  
  if (rectificationIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '整改记录不存在'
    };
    return;
  }
  
  data.rectifications.splice(rectificationIndex, 1);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    message: '整改记录删除成功'
  };
});

module.exports = router;
