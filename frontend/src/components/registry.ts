import type { ComponentType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ComponentMeta {
  type: ComponentType;
  name: string;
  icon: string;
  category: 'chart' | 'basic' | 'map';
  defaultWidth: number;
  defaultHeight: number;
}

export const componentRegistry: ComponentMeta[] = [
  { type: 'line-chart', name: '折线图', icon: '📈', category: 'chart', defaultWidth: 500, defaultHeight: 300 },
  { type: 'bar-chart', name: '柱状图', icon: '📊', category: 'chart', defaultWidth: 500, defaultHeight: 300 },
  { type: 'pie-chart', name: '饼图', icon: '🥧', category: 'chart', defaultWidth: 400, defaultHeight: 300 },
  { type: 'radar-chart', name: '雷达图', icon: '🎯', category: 'chart', defaultWidth: 400, defaultHeight: 350 },
  { type: 'area-chart', name: '面积图', icon: '📉', category: 'chart', defaultWidth: 500, defaultHeight: 300 },
  { type: 'scatter-chart', name: '散点图', icon: '⚬', category: 'chart', defaultWidth: 450, defaultHeight: 350 },
  { type: 'funnel-chart', name: '漏斗图', icon: '🔻', category: 'chart', defaultWidth: 350, defaultHeight: 400 },
  { type: 'gauge-chart', name: '仪表盘', icon: '⏱️', category: 'chart', defaultWidth: 350, defaultHeight: 350 },
  { type: 'map-china', name: '中国地图', icon: '🗺️', category: 'map', defaultWidth: 600, defaultHeight: 450 },
  { type: 'text', name: '文本', icon: '📝', category: 'basic', defaultWidth: 200, defaultHeight: 80 },
  { type: 'title', name: '标题', icon: '🏷️', category: 'basic', defaultWidth: 300, defaultHeight: 60 },
  { type: 'image', name: '图片', icon: '🖼️', category: 'basic', defaultWidth: 300, defaultHeight: 200 },
  { type: 'rectangle', name: '矩形', icon: '⬜', category: 'basic', defaultWidth: 200, defaultHeight: 150 },
  { type: 'border', name: '边框', icon: '📋', category: 'basic', defaultWidth: 300, defaultHeight: 200 },
  { type: 'table', name: '表格', icon: '📋', category: 'chart', defaultWidth: 500, defaultHeight: 300 },
  { type: 'progress', name: '进度条', icon: '📊', category: 'chart', defaultWidth: 300, defaultHeight: 60 },
  { type: 'countup', name: '数字翻牌', icon: '🔢', category: 'chart', defaultWidth: 250, defaultHeight: 100 },
];

export function getComponentMeta(type: ComponentType): ComponentMeta | undefined {
  return componentRegistry.find((c) => c.type === type);
}

export function createDefaultComponent(type: ComponentType, x: number = 100, y: number = 100) {
  const meta = getComponentMeta(type);
  if (!meta) return null;

  return {
    id: uuidv4(),
    type,
    x,
    y,
    width: meta.defaultWidth,
    height: meta.defaultHeight,
    zIndex: Date.now(),
    name: meta.name,
    config: getDefaultConfig(type),
    data: {
      type: 'mock' as const,
      staticData: [],
      mockConfig: { count: 6, min: 0, max: 100 },
    },
    style: getDefaultStyle(type),
    animation: {
      enabled: true,
      duration: 1000,
      easing: 'cubicOut',
      delay: 0,
    },
    interaction: {
      clickable: false,
      hoverable: true,
      tooltip: true,
      zoomable: false,
    },
  };
}

function getDefaultConfig(type: ComponentType) {
  switch (type) {
    case 'line-chart':
      return { smooth: true, showSymbol: true, showLegend: true };
    case 'bar-chart':
      return { showLegend: true, borderRadius: 4 };
    case 'pie-chart':
      return { roseType: false, radius: ['40%', '70%'], showLabel: true };
    case 'radar-chart':
      return { indicatorCount: 5, showLegend: true };
    case 'area-chart':
      return { smooth: true, areaOpacity: 0.3 };
    case 'scatter-chart':
      return { symbolSize: 20, showLegend: true };
    case 'funnel-chart':
      return { sort: 'descending', showLabel: true };
    case 'gauge-chart':
      return { min: 0, max: 100, startAngle: 225, endAngle: -45 };
    case 'map-china':
      return { visualMap: true, roam: true };
    case 'text':
      return { content: '文本内容', fontSize: 16, fontWeight: 'normal', align: 'left' };
    case 'title':
      return { content: '标题文本', fontSize: 24, fontWeight: 'bold', align: 'center' };
    case 'image':
      return { src: '', fitMode: 'contain', objectFit: 'contain' };
    case 'rectangle':
      return { backgroundColor: '#6366f1', borderRadius: 0, opacity: 1 };
    case 'border':
      return { borderWidth: 2, borderColor: '#818cf8', borderStyle: 'solid', borderRadius: 0 };
    case 'table':
      return { columns: [], data: [], headerBackground: '#4f46e5', headerColor: '#fff', stripe: true };
    case 'progress':
      return { percent: 75, color: '#8b5cf6', strokeWidth: 12, showInfo: true };
    case 'countup':
      return { value: 1234567, prefix: '', suffix: '', decimals: 0, duration: 2 };
    default:
      return {};
  }
}

function getDefaultStyle(type: ComponentType) {
  return {
    backgroundColor: type === 'rectangle' ? '#6366f1' : 'transparent',
    borderRadius: 0,
    opacity: 1,
    borderColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'solid' as const,
    padding: 0,
    color: '#ffffff',
    fontFamily: 'system-ui',
    textAlign: 'center' as const,
  };
}
