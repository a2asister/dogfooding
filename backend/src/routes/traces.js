const Router = require('koa-router');
const { 
  createTrace, 
  createChildSpan, 
  finishSpan,
  getTrace,
  getTraceWithLogs,
  getTraceTree,
  searchTraces
} = require('../utils/traceManager');

const router = new Router();

router.post('/create', async (ctx) => {
  const { service, operation, traceId, metadata, tags } = ctx.request.body;
  
  if (!service || !operation) {
    ctx.status = 400;
    ctx.body = { error: 'Service and operation are required' };
    return;
  }
  
  const result = createTrace(service, operation, {
    traceId,
    metadata,
    tags
  });
  
  ctx.body = { success: true, data: result };
});

router.post('/span', async (ctx) => {
  const { traceId, parentSpanId, service, operation, tags } = ctx.request.body;
  
  if (!traceId || !parentSpanId || !service || !operation) {
    ctx.status = 400;
    ctx.body = { error: 'traceId, parentSpanId, service and operation are required' };
    return;
  }
  
  const result = createChildSpan(traceId, parentSpanId, service, operation, { tags });
  
  if (!result) {
    ctx.status = 404;
    ctx.body = { error: 'Trace not found' };
    return;
  }
  
  ctx.body = { success: true, data: result };
});

router.post('/span/:spanId/finish', async (ctx) => {
  const { spanId } = ctx.params;
  const { traceId, status, tags } = ctx.request.body;
  
  if (!traceId) {
    ctx.status = 400;
    ctx.body = { error: 'traceId is required' };
    return;
  }
  
  const result = finishSpan(traceId, spanId, status || 'ok', tags || {});
  
  if (!result) {
    ctx.status = 404;
    ctx.body = { error: 'Trace or span not found' };
    return;
  }
  
  ctx.body = { success: true };
});

router.get('/search', async (ctx) => {
  const { service, operation, status, startTime, endTime, limit } = ctx.query;
  
  const results = searchTraces({
    service,
    operation,
    status,
    startTime: startTime ? parseInt(startTime) : undefined,
    endTime: endTime ? parseInt(endTime) : undefined,
    limit: limit ? parseInt(limit) : undefined
  });
  
  ctx.body = { data: results };
});

router.get('/:traceId', async (ctx) => {
  const { traceId } = ctx.params;
  const trace = getTrace(traceId);
  
  if (!trace) {
    ctx.status = 404;
    ctx.body = { error: 'Trace not found' };
    return;
  }
  
  ctx.body = { data: trace };
});

router.get('/:traceId/with-logs', async (ctx) => {
  const { traceId } = ctx.params;
  const trace = getTraceWithLogs(traceId);
  
  if (!trace) {
    ctx.status = 404;
    ctx.body = { error: 'Trace not found' };
    return;
  }
  
  ctx.body = { data: trace };
});

router.get('/:traceId/tree', async (ctx) => {
  const { traceId } = ctx.params;
  const traceTree = getTraceTree(traceId);
  
  if (!traceTree) {
    ctx.status = 404;
    ctx.body = { error: 'Trace not found' };
    return;
  }
  
  ctx.body = { data: traceTree };
});

module.exports = router;
