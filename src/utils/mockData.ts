import type { FloodData, HistoricalRecord } from '@/types';
import { DAM_DEFAULT_PARAMS } from '@/stores/appStore';

export function generateMockFloodData(baseData?: Partial<FloodData>): FloodData {
  const now = Date.now();
  const baseUpstream = baseData?.upstreamWaterLevel ?? 155 + Math.random() * 10;
  const baseDownstream = baseData?.downstreamWaterLevel ?? 65 + Math.random() * 5;
  const baseFlow = baseData?.dischargeFlow ?? 15000 + Math.random() * 40000;
  const baseHoles = baseData?.openHoles ?? generateRandomHoles(Math.floor(3 + Math.random() * 8));
  
  return {
    id: `data-${now}`,
    timestamp: now,
    upstreamWaterLevel: Number(baseUpstream.toFixed(2)),
    downstreamWaterLevel: Number(baseDownstream.toFixed(2)),
    dischargeFlow: Math.floor(baseFlow),
    dischargeDuration: baseData?.dischargeDuration ?? Math.floor(30 + Math.random() * 120),
    openHoles: baseHoles,
    totalHoles: DAM_DEFAULT_PARAMS.totalDischargeHoles,
  };
}

function generateRandomHoles(count: number): number[] {
  const holes: Set<number> = new Set();
  const totalHoles = DAM_DEFAULT_PARAMS.totalDischargeHoles;
  
  while (holes.size < Math.min(count, totalHoles)) {
    holes.add(Math.floor(Math.random() * totalHoles) + 1);
  }
  
  return Array.from(holes).sort((a, b) => a - b);
}

export function generateHistoricalRecords(): HistoricalRecord[] {
  const records: HistoricalRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 30 - Math.floor(Math.random() * 15));
    
    const recordDate = date.toISOString().split('T')[0];
    const startTime = `${8 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const endHour = 16 + Math.floor(Math.random() * 6);
    const endTime = `${endHour}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    
    const dataPoints: FloodData[] = [];
    const baseData = generateMockFloodData();
    let currentFlow = 10000 + Math.random() * 30000;
    let currentLevel = 150 + Math.random() * 15;
    
    for (let j = 0; j < 24; j++) {
      currentFlow += (Math.random() - 0.5) * 5000;
      currentFlow = Math.max(5000, Math.min(70000, currentFlow));
      
      currentLevel += (Math.random() - 0.5) * 0.5;
      currentLevel = Math.max(145, Math.min(175, currentLevel));
      
      const holeCount = Math.floor(currentFlow / 8000);
      const holes = generateRandomHoles(Math.min(holeCount, 15));
      
      dataPoints.push({
        ...baseData,
        id: `history-${recordDate}-${j}`,
        timestamp: date.getTime() + j * 300000,
        dischargeFlow: Math.floor(currentFlow),
        upstreamWaterLevel: Number(currentLevel.toFixed(2)),
        downstreamWaterLevel: Number((65 + Math.random() * 5).toFixed(2)),
        dischargeDuration: j * 5 + 30,
        openHoles: holes,
      });
    }
    
    const flows = dataPoints.map(d => d.dischargeFlow);
    const levels = dataPoints.map(d => d.upstreamWaterLevel);
    
    records.push({
      id: `history-${recordDate}`,
      date: recordDate,
      startTime,
      endTime,
      maxDischargeFlow: Math.max(...flows),
      avgDischargeFlow: Math.floor(flows.reduce((a, b) => a + b, 0) / flows.length),
      maxUpstreamLevel: Math.max(...levels),
      minUpstreamLevel: Math.min(...levels),
      openHoles: [...new Set(dataPoints.flatMap(d => d.openHoles))].sort((a, b) => a - b),
      dataPoints,
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
