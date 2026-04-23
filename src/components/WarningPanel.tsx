import { useAppStore } from '@/stores/appStore';
import { 
  AlertTriangle, 
  Bell, 
  X, 
  Check,
  AlertCircle,
  AlertOctagon,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const WARNING_COLORS = {
  normal: { bg: 'bg-nature-green/20', border: 'border-nature-green/30', text: 'text-nature-green', icon: Info },
  attention: { bg: 'bg-warning-amber/20', border: 'border-warning-amber/30', text: 'text-warning-amber', icon: AlertTriangle },
  warning: { bg: 'bg-warning-amber/30', border: 'border-warning-amber/50', text: 'text-warning-amber', icon: AlertCircle },
  danger: { bg: 'bg-danger-red/30', border: 'border-danger-red/50', text: 'text-danger-red', icon: AlertOctagon },
};

const WARNING_LABELS = {
  normal: '正常',
  attention: '关注',
  warning: '警告',
  danger: '危险',
};

export function WarningIndicator() {
  const { warnings, toggleWarningPanel, ui } = useAppStore();
  
  const unacknowledgedWarnings = warnings.filter(w => !w.acknowledged);
  const highestLevel = getHighestWarningLevel(unacknowledgedWarnings);
  
  if (unacknowledgedWarnings.length === 0) {
    return null;
  }
  
  const colors = WARNING_COLORS[highestLevel];
  const Icon = colors.icon;
  
  return (
    <button
      onClick={toggleWarningPanel}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full ${colors.bg} ${colors.border} border ${colors.text} flex items-center gap-2 animate-pulse-slow`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">
        {unacknowledgedWarnings.length} 条预警
      </span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg}`}>
        {WARNING_LABELS[highestLevel]}
      </span>
    </button>
  );
}

export function WarningPanel() {
  const { warnings, ui, toggleWarningPanel, acknowledgeWarning, clearWarnings } = useAppStore();
  
  if (!ui.warningPanelOpen) {
    return null;
  }
  
  const unacknowledged = warnings.filter(w => !w.acknowledged);
  const acknowledged = warnings.filter(w => w.acknowledged);
  
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 glass-panel w-96 max-h-[500px] flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-warning-amber" />
          <h3 className="font-semibold">预警信息</h3>
        </div>
        <div className="flex items-center gap-2">
          {warnings.length > 0 && (
            <button
              onClick={clearWarnings}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              清除全部
            </button>
          )}
          <button onClick={toggleWarningPanel} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {warnings.length === 0 ? (
          <div className="p-8 text-center">
            <Info className="w-8 h-8 mx-auto text-white/30 mb-2" />
            <p className="text-white/50 text-sm">暂无预警信息</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {unacknowledged.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-white/50 px-2 py-1 mb-1">未确认 ({unacknowledged.length})</div>
                {unacknowledged.map(warning => (
                  <WarningItem
                    key={warning.id}
                    warning={warning}
                    onAcknowledge={() => acknowledgeWarning(warning.id)}
                  />
                ))}
              </div>
            )}
            
            {acknowledged.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-white/50 px-2 py-1 mb-1">已确认 ({acknowledged.length})</div>
                {acknowledged.slice(-10).map(warning => (
                  <WarningItem
                    key={warning.id}
                    warning={warning}
                    acknowledged
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WarningItemProps {
  warning: ReturnType<typeof useAppStore>['warnings'][0];
  acknowledged?: boolean;
  onAcknowledge?: () => void;
}

function WarningItem({ warning, acknowledged = false, onAcknowledge }: WarningItemProps) {
  const colors = WARNING_COLORS[warning.level];
  const Icon = colors.icon;
  
  return (
    <div className={`p-3 m-1 rounded-lg ${colors.bg} ${colors.border} border ${acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium ${colors.text} mb-1`}>
              {WARNING_LABELS[warning.level]}
              <span className="mx-1 text-white/40">·</span>
              <span className="text-white/60 font-normal">
                {warning.type === 'upstreamLevel' ? '上游水位' : '泄洪流量'}
              </span>
            </div>
            <p className="text-sm text-white/80 break-words">
              {warning.message}
            </p>
            <div className="text-xs text-white/40 mt-1">
              当前: {warning.type === 'upstreamLevel' 
                ? `${warning.currentValue.toFixed(2)}m` 
                : `${warning.currentValue.toLocaleString()} m³/s`
              }
              <span className="mx-1">/</span>
              阈值: {warning.type === 'upstreamLevel' 
                ? `${warning.threshold.toFixed(2)}m` 
                : `${warning.threshold.toLocaleString()} m³/s`
              }
            </div>
            <div className="text-xs text-white/30 mt-1">
              {format(warning.timestamp, 'HH:mm:ss', { locale: zhCN })}
            </div>
          </div>
        </div>
        
        {!acknowledged && onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="flex-shrink-0 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            title="确认"
          >
            <Check className="w-4 h-4 text-nature-green" />
          </button>
        )}
      </div>
    </div>
  );
}

function getHighestWarningLevel(warnings: ReturnType<typeof useAppStore>['warnings']) {
  if (warnings.length === 0) return 'normal';
  
  const levels = {
    normal: 0,
    attention: 1,
    warning: 2,
    danger: 3,
  };
  
  let highest = 'normal';
  let highestValue = 0;
  
  for (const warning of warnings) {
    const value = levels[warning.level];
    if (value > highestValue) {
      highestValue = value;
      highest = warning.level;
    }
  }
  
  return highest;
}
