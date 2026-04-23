import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { History, Search, Filter, Play, ChevronRight, X } from 'lucide-react';
import type { HistoricalRecord } from '@/types';

export function HistoryPanel() {
  const { 
    mode, 
    historicalRecords, 
    selectedHistoryId, 
    setSelectedHistoryId,
    historyPlaybackIndex,
    setHistoryPlaybackIndex,
    isPlayingHistory,
    setIsPlayingHistory,
    currentData,
    setCurrentData,
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [minFlow, setMinFlow] = useState<number | ''>('');
  const [maxFlow, setMaxFlow] = useState<number | ''>('');
  
  const filteredRecords = useMemo(() => {
    return historicalRecords.filter(record => {
      const matchesSearch = !searchTerm || 
        record.date.includes(searchTerm) ||
        record.startTime.includes(searchTerm);
      
      const matchesMinFlow = minFlow === '' || record.maxDischargeFlow >= minFlow;
      const matchesMaxFlow = maxFlow === '' || record.maxDischargeFlow <= maxFlow;
      
      return matchesSearch && matchesMinFlow && matchesMaxFlow;
    });
  }, [historicalRecords, searchTerm, minFlow, maxFlow]);
  
  const selectedRecord = historicalRecords.find(r => r.id === selectedHistoryId);
  
  const handlePlayRecord = (record: HistoricalRecord) => {
    setSelectedHistoryId(record.id);
    setHistoryPlaybackIndex(0);
    setIsPlayingHistory(true);
    
    if (record.dataPoints[0]) {
      setCurrentData(record.dataPoints[0]);
    }
  };
  
  if (mode !== 'history') {
    return null;
  }
  
  return (
    <>
      <div className="fixed right-4 top-20 z-40 glass-panel w-80 max-h-[calc(100vh-200px)] flex flex-col">
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-water-light" />
              <h3 className="font-semibold">历史记录</h3>
            </div>
            <span className="text-xs text-white/50">
              共 {historicalRecords.length} 条
            </span>
          </div>
          
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="搜索日期..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-water-blue/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <input
              type="number"
              placeholder="最小流量"
              value={minFlow}
              onChange={(e) => setMinFlow(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-water-blue/50"
            />
            <span className="text-white/40">-</span>
            <input
              type="number"
              placeholder="最大流量"
              value={maxFlow}
              onChange={(e) => setMaxFlow(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-water-blue/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-4 text-center text-white/50 text-sm">
              无匹配记录
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredRecords.map((record) => (
                <HistoryRecordItem
                  key={record.id}
                  record={record}
                  isSelected={record.id === selectedHistoryId}
                  onPlay={() => handlePlayRecord(record)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedRecord && (
        <div className="fixed right-88 top-20 z-40 glass-panel w-72 max-h-[400px]">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h4 className="font-medium text-sm">记录详情</h4>
            <button 
              onClick={() => {
                setSelectedHistoryId(null);
                setIsPlayingHistory(false);
              }}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-3 space-y-3">
            <DetailItem 
              label="日期" 
              value={format(parseISO(selectedRecord.date), 'yyyy年MM月dd日', { locale: zhCN })}
            />
            <DetailItem 
              label="时间段" 
              value={`${selectedRecord.startTime} - ${selectedRecord.endTime}`}
            />
            <DetailItem 
              label="最大泄洪流量" 
              value={`${selectedRecord.maxDischargeFlow.toLocaleString()} m³/s`}
              highlight
            />
            <DetailItem 
              label="平均泄洪流量" 
              value={`${selectedRecord.avgDischargeFlow.toLocaleString()} m³/s`}
            />
            <DetailItem 
              label="最高上游水位" 
              value={`${selectedRecord.maxUpstreamLevel.toFixed(2)} m`}
            />
            <DetailItem 
              label="最低上游水位" 
              value={`${selectedRecord.minUpstreamLevel.toFixed(2)} m`}
            />
            <DetailItem 
              label="开启泄洪孔" 
              value={`${selectedRecord.openHoles.length} 个`}
            />
            
            <div className="pt-2">
              <button
                onClick={() => handlePlayRecord(selectedRecord)}
                className="w-full control-btn-primary justify-center"
              >
                <Play className="w-4 h-4" />
                播放此记录
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface HistoryRecordItemProps {
  record: HistoricalRecord;
  isSelected: boolean;
  onPlay: () => void;
}

function HistoryRecordItem({ record, isSelected, onPlay }: HistoryRecordItemProps) {
  return (
    <div 
      className={`p-3 hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/10' : ''}`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm font-medium">
          {format(parseISO(record.date), 'MM月dd日', { locale: zhCN })}
        </div>
        <button
          onClick={onPlay}
          className="p-1.5 rounded bg-water-blue/20 hover:bg-water-blue/30 transition-colors"
        >
          <Play className="w-3.5 h-3.5 text-water-light" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
        <span>{record.startTime} - {record.endTime}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-water-light">
            流量: {record.maxDischargeFlow.toLocaleString()} m³/s
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/50">
          <span>详情</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">{label}</span>
      <span className={`text-sm ${highlight ? 'text-water-light font-medium' : 'text-white/80'}`}>
        {value}
      </span>
    </div>
  );
}
