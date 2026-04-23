import type { FloodData, HistoricalRecord, WarningLevel } from '@/types';
import { DAM_DEFAULT_PARAMS } from '@/stores/appStore';

export const WARNING_LEVELS: Record<string, WarningLevel> = {
  upstreamLevel: {
    level: 'normal',
    threshold: DAM_DEFAULT_PARAMS.floodLimitLevel,
    message: '正常水位'
  },
  upstreamLevelAttention: {
    level: 'attention',
    threshold: 155,
    message: '水位上升，请关注'
  },
  upstreamLevelWarning: {
    level: 'warning',
    threshold: 165,
    message: '水位较高，注意防洪'
  },
  upstreamLevelDanger: {
    level: 'danger',
    threshold: 175,
    message: '水位超过警戒线，紧急防洪'
  },
  dischargeFlow: {
    level: 'normal',
    threshold: 20000,
    message: '正常泄洪流量'
  },
  dischargeFlowAttention: {
    level: 'attention',
    threshold: 40000,
    message: '流量增大，请关注'
  },
  dischargeFlowWarning: {
    level: 'warning',
    threshold: 60000,
    message: '大流量泄洪中'
  },
  dischargeFlowDanger: {
    level: 'danger',
    threshold: DAM_DEFAULT_PARAMS.designDischargeCapacity,
    message: '超设计流量泄洪'
  },
};

export function getWarningLevelForUpstreamLevel(level: number): WarningLevel {
  if (level >= WARNING_LEVELS.upstreamLevelDanger.threshold) {
    return {
      level: 'danger',
      threshold: WARNING_LEVELS.upstreamLevelDanger.threshold,
      message: WARNING_LEVELS.upstreamLevelDanger.message
    };
  }
  if (level >= WARNING_LEVELS.upstreamLevelWarning.threshold) {
    return {
      level: 'warning',
      threshold: WARNING_LEVELS.upstreamLevelWarning.threshold,
      message: WARNING_LEVELS.upstreamLevelWarning.message
    };
  }
  if (level >= WARNING_LEVELS.upstreamLevelAttention.threshold) {
    return {
      level: 'attention',
      threshold: WARNING_LEVELS.upstreamLevelAttention.threshold,
      message: WARNING_LEVELS.upstreamLevelAttention.message
    };
  }
  return {
    level: 'normal',
    threshold: WARNING_LEVELS.upstreamLevel.threshold,
    message: WARNING_LEVELS.upstreamLevel.message
  };
}

export function getWarningLevelForDischargeFlow(flow: number): WarningLevel {
  if (flow >= WARNING_LEVELS.dischargeFlowDanger.threshold) {
    return {
      level: 'danger',
      threshold: WARNING_LEVELS.dischargeFlowDanger.threshold,
      message: WARNING_LEVELS.dischargeFlowDanger.message
    };
  }
  if (flow >= WARNING_LEVELS.dischargeFlowWarning.threshold) {
    return {
      level: 'warning',
      threshold: WARNING_LEVELS.dischargeFlowWarning.threshold,
      message: WARNING_LEVELS.dischargeFlowWarning.message
    };
  }
  if (flow >= WARNING_LEVELS.dischargeFlowAttention.threshold) {
    return {
      level: 'attention',
      threshold: WARNING_LEVELS.dischargeFlowAttention.threshold,
      message: WARNING_LEVELS.dischargeFlowAttention.message
    };
  }
  return {
    level: 'normal',
    threshold: WARNING_LEVELS.dischargeFlow.threshold,
    message: WARNING_LEVELS.dischargeFlow.message
  };
}

export function formatWaterLevel(level: number): string {
  return `${level.toFixed(2)}m`;
}

export function formatDischargeFlow(flow: number): string {
  return `${flow.toLocaleString()} m³/s`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function formatHoles(openHoles: number[]): string {
  return openHoles.length === 0 ? '无' : openHoles.join(', ');
}
