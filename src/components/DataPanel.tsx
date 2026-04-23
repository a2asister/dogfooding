import { useAppStore } from '@/stores/appStore';
import { formatWaterLevel, formatDischargeFlow, formatDuration, formatHoles } from '@/utils/warning';
import { Droplets, Waves, ArrowUp, ArrowDown, Clock, AlertTriangle, Eye } from 'lucide-react';

export function DataPanel() {
  const { currentData, ui, toggleDataPanel, isLoading } = useAppStore();
  
  if (!ui.dataPanelOpen) {
    return (
      <button
        onClick={toggleDataPanel}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 glass-panel p-3 hover:bg-white/20 transition-all"
      >
        <Eye className="w-5 h-5" />
      </button>
    );
  }
  
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 glass-panel w-64">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="font-semibold text-sm">实时数据</h3>
        <button onClick={toggleDataPanel} className="text-white/60 hover:text-white">
          ×
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-water-blue border-t-transparent"></div>
        </div>
      ) : currentData ? (
        <div className="p-3 space-y-3">
          <DataCard
            icon={<ArrowUp className="w-4 h-4" />}
            label="上游水位"
            value={formatWaterLevel(currentData.upstreamWaterLevel)}
            trend="up"
          />
          
          <DataCard
            icon={<ArrowDown className="w-4 h-4" />}
            label="下游水位"
            value={formatWaterLevel(currentData.downstreamWaterLevel)}
            trend="down"
          />
          
          <DataCard
            icon={<Waves className="w-4 h-4" />}
            label="泄洪流量"
            value={formatDischargeFlow(currentData.dischargeFlow)}
          />
          
          <DataCard
            icon={<Clock className="w-4 h-4" />}
            label="泄洪时长"
            value={formatDuration(currentData.dischargeDuration)}
          />
          
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-water-light" />
              <span className="text-xs text-white/70">泄洪孔开启</span>
            </div>
            <div className="text-sm font-medium">
              {currentData.openHoles.length} 个孔
              <span className="text-white/50 text-xs ml-2">
                (共 {currentData.totalHoles} 个)
              </span>
            </div>
            <div className="text-xs text-white/60 mt-1 max-h-16 overflow-y-auto">
              {formatHoles(currentData.openHoles)}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-white/50 text-sm">
          暂无数据
        </div>
      )}
    </div>
  );
}

interface DataCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
}

function DataCard({ icon, label, value, trend }: DataCardProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-water-light">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-white/60">{label}</div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">{value}</span>
          {trend === 'up' && <ArrowUp className="w-3 h-3 text-nature-green" />}
          {trend === 'down' && <ArrowDown className="w-3 h-3 text-warning-amber" />}
        </div>
      </div>
    </div>
  );
}
