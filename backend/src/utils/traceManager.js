const { v4: uuidv4 } = require('uuid');
const { tracesStore, logsStore } = require('./store');

function generateTraceId() {
  return uuidv4();
}

function generateSpanId() {
  return uuidv4().substring(0, 16);
}

function createTrace(service, operation, options = {}) {
  const traceId = options.traceId || generateTraceId();
  const spanId = generateSpanId();
  
  const trace = {
    traceId,
    rootSpanId: spanId,
    service,
    operation,
    startTime: Date.now(),
    status: 'in_progress',
    spans: [],
    metadata: options.metadata || {}
  };
  
  const rootSpan = {
    spanId,
    parentSpanId: null,
    service,
    operation,
    startTime: Date.now(),
    status: 'in_progress',
    tags: options.tags || {}
  };
  
  trace.spans.push(rootSpan);
  
  tracesStore.append(trace);
  
  return { traceId, spanId };
}

function createChildSpan(traceId, parentSpanId, service, operation, options = {}) {
  const traces = tracesStore.read();
  const trace = traces.find(t => t.traceId === traceId);
  
  if (!trace) {
    return null;
  }
  
  const spanId = generateSpanId();
  
  const span = {
    spanId,
    parentSpanId,
    service,
    operation,
    startTime: Date.now(),
    status: 'in_progress',
    tags: options.tags || {}
  };
  
  trace.spans.push(span);
  tracesStore.write(traces);
  
  return { traceId, spanId };
}

function finishSpan(traceId, spanId, status = 'ok', tags = {}) {
  const traces = tracesStore.read();
  const trace = traces.find(t => t.traceId === traceId);
  
  if (!trace) return false;
  
  const span = trace.spans.find(s => s.spanId === spanId);
  if (!span) return false;
  
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  span.status = status;
  span.tags = { ...span.tags, ...tags };
  
  if (span.spanId === trace.rootSpanId) {
    trace.status = status;
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
  }
  
  tracesStore.write(traces);
  return true;
}

function getTrace(traceId) {
  const traces = tracesStore.read();
  return traces.find(t => t.traceId === traceId);
}

function getTraceWithLogs(traceId) {
  const trace = getTrace(traceId);
  if (!trace) return null;
  
  const logs = logsStore.find(log => log.traceId === traceId);
  
  return {
    ...trace,
    logs: logs.sort((a, b) => a.timestamp - b.timestamp)
  };
}

function getTraceTree(traceId) {
  const trace = getTrace(traceId);
  if (!trace) return null;
  
  const spanMap = {};
  const roots = [];
  
  trace.spans.forEach(span => {
    spanMap[span.spanId] = { ...span, children: [] };
  });
  
  trace.spans.forEach(span => {
    const node = spanMap[span.spanId];
    if (span.parentSpanId && spanMap[span.parentSpanId]) {
      spanMap[span.parentSpanId].children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  return {
    ...trace,
    tree: roots.length === 1 ? roots[0] : roots
  };
}

function searchTraces(options = {}) {
  const { service, operation, status, startTime, endTime, limit = 100 } = options;
  
  let traces = tracesStore.read();
  
  if (service) {
    traces = traces.filter(t => t.service === service);
  }
  
  if (operation) {
    traces = traces.filter(t => t.operation === operation);
  }
  
  if (status) {
    traces = traces.filter(t => t.status === status);
  }
  
  if (startTime) {
    traces = traces.filter(t => t.startTime >= startTime);
  }
  
  if (endTime) {
    traces = traces.filter(t => t.startTime <= endTime);
  }
  
  traces.sort((a, b) => b.startTime - a.startTime);
  
  return traces.slice(0, limit);
}

module.exports = {
  generateTraceId,
  generateSpanId,
  createTrace,
  createChildSpan,
  finishSpan,
  getTrace,
  getTraceWithLogs,
  getTraceTree,
  searchTraces
};
