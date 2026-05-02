import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { CollaborationRecord, Employee } from '../types';

const router = new Router({ prefix: '/api/collaboration' });

router.get('/', async (ctx) => {
  const { fromEmployeeId, toEmployeeId, startDate, endDate } = ctx.query;
  let records = storage.read<CollaborationRecord>('collaborations');
  
  if (fromEmployeeId) {
    records = records.filter(r => r.fromEmployeeId === fromEmployeeId);
  }
  if (toEmployeeId) {
    records = records.filter(r => r.toEmployeeId === toEmployeeId);
  }
  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }
  
  ctx.body = { success: true, data: records };
});

router.get('/stats/network', async (ctx) => {
  const records = storage.read<CollaborationRecord>('collaborations');
  const employees = storage.read<Employee>('employees');
  
  const empMap = new Map(employees.map(e => [e.id, { id: e.id, name: e.name, department: e.department }]));
  
  const nodeMap = new Map<string, { id: string; name: string; department: string; value: number; inCount: number; outCount: number }>();
  const linkMap = new Map<string, { source: string; target: string; value: number; type: string }>();
  
  records.forEach(record => {
    if (!nodeMap.has(record.fromEmployeeId)) {
      const emp = empMap.get(record.fromEmployeeId);
      nodeMap.set(record.fromEmployeeId, {
        id: record.fromEmployeeId,
        name: emp?.name || '',
        department: emp?.department || '',
        value: 0,
        inCount: 0,
        outCount: 0
      });
    }
    if (!nodeMap.has(record.toEmployeeId)) {
      const emp = empMap.get(record.toEmployeeId);
      nodeMap.set(record.toEmployeeId, {
        id: record.toEmployeeId,
        name: emp?.name || '',
        department: emp?.department || '',
        value: 0,
        inCount: 0,
        outCount: 0
      });
    }
    
    const fromNode = nodeMap.get(record.fromEmployeeId)!;
    const toNode = nodeMap.get(record.toEmployeeId)!;
    
    fromNode.outCount += 1;
    fromNode.value += record.frequency;
    toNode.inCount += 1;
    toNode.value += record.frequency;
    
    const linkKey = `${record.fromEmployeeId}-${record.toEmployeeId}`;
    if (!linkMap.has(linkKey)) {
      linkMap.set(linkKey, {
        source: record.fromEmployeeId,
        target: record.toEmployeeId,
        value: 0,
        type: record.type
      });
    }
    const link = linkMap.get(linkKey)!;
    link.value += record.frequency;
  });
  
  ctx.body = {
    success: true,
    data: {
      nodes: Array.from(nodeMap.values()),
      links: Array.from(linkMap.values())
    }
  };
});

router.get('/stats/types', async (ctx) => {
  const records = storage.read<CollaborationRecord>('collaborations');
  
  const typeStats = new Map<string, { type: string; count: number; totalFrequency: number; totalDuration: number; avgDuration: number }>();
  
  records.forEach(record => {
    if (!typeStats.has(record.type)) {
      typeStats.set(record.type, {
        type: record.type,
        count: 0,
        totalFrequency: 0,
        totalDuration: 0,
        avgDuration: 0
      });
    }
    const stat = typeStats.get(record.type)!;
    stat.count += 1;
    stat.totalFrequency += record.frequency;
    stat.totalDuration += record.duration;
  });
  
  const result = Array.from(typeStats.values()).map(s => ({
    ...s,
    avgDuration: s.count > 0 ? Math.round(s.totalDuration / s.count) : 0
  }));
  
  ctx.body = { success: true, data: result };
});

export default router;
