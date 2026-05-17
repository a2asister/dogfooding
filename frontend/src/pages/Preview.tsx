import { createEffect, createSignal, For, Show, onCleanup } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { dashboardApi } from '../services/api';
import type { ComponentType } from '../types';
import * as echarts from 'echarts';
import { generateMockData, generatePieData } from '../utils/mockData';

function ChartComponent(props: { component: any }) {
  let chartRef: HTMLDivElement | undefined;
  let chartInstance: echarts.ECharts | undefined;

  const getChartData = () => {
    const { data, type } = props.component;
    const mockConfig = data.mockConfig || { count: 6, min: 0, max: 100 };

    if (data.type === 'static' && data.staticData && data.staticData.length > 0) {
      return data.staticData;
    }

    switch (type) {
      case 'pie-chart':
      case 'funnel-chart':
        return generatePieData(mockConfig.count);
      default:
        return generateMockData(mockConfig.count, mockConfig.min, mockConfig.max);
    }
  };

  createEffect(() => {
    if (!chartRef) return;

    chartInstance = echarts.init(chartRef);
    const chartData = getChartData();
    const { config, style, type, animation } = props.component;
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

    const baseOption: echarts.EChartsOption = {
      backgroundColor: style.backgroundColor || 'transparent',
      textStyle: {
        color: style.color || '#ffffff',
        fontFamily: style.fontFamily || 'system-ui',
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
      },
      animation: animation?.enabled ?? true,
      animationDuration: animation?.duration || 1000,
      animationEasing: (animation?.easing as any) || 'cubicOut',
    };

    let option: echarts.EChartsOption = {};

    switch (type) {
      case 'line-chart':
        option = {
          ...baseOption,
          tooltip: { trigger: 'axis' },
          legend: config.showLegend ? { data: ['数值'], textStyle: { color: '#fff' } } : undefined,
          xAxis: {
            type: 'category',
            data: chartData.map((d: any) => d.name),
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
          },
          series: [{
            name: '数值',
            type: 'line',
            data: chartData.map((d: any) => d.value),
            smooth: config.smooth,
            showSymbol: config.showSymbol,
            lineStyle: { width: 3, color: colors[0] },
            itemStyle: { color: colors[0] },
          }],
        };
        break;

      case 'bar-chart':
        option = {
          ...baseOption,
          tooltip: { trigger: 'axis' },
          legend: config.showLegend ? { data: ['数值'], textStyle: { color: '#fff' } } : undefined,
          xAxis: {
            type: 'category',
            data: chartData.map((d: any) => d.name),
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
          },
          series: [{
            name: '数值',
            type: 'bar',
            data: chartData.map((d: any) => d.value),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[0] + '80' },
              ]),
              borderRadius: config.borderRadius || 0,
            },
            barWidth: '60%',
          }],
        };
        break;

      case 'pie-chart':
        option = {
          ...baseOption,
          tooltip: { trigger: 'item' },
          legend: config.showLegend !== false ? { orient: 'vertical', left: 'left', textStyle: { color: '#fff' } } : undefined,
          series: [{
            type: 'pie',
            radius: config.radius || ['40%', '70%'],
            roseType: config.roseType ? 'radius' : undefined,
            data: chartData,
            label: config.showLabel !== false ? { color: '#fff' } : { show: false },
          }],
        };
        break;

      case 'area-chart':
        option = {
          ...baseOption,
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.map((d: any) => d.name),
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
          },
          series: [{
            type: 'line',
            data: chartData.map((d: any) => d.value),
            smooth: config.smooth !== false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[0] + '80' },
                { offset: 1, color: colors[0] + '00' },
              ]),
              opacity: config.areaOpacity || 0.3,
            },
            lineStyle: { width: 2, color: colors[0] },
            itemStyle: { color: colors[0] },
          }],
        };
        break;

      case 'radar-chart':
        option = {
          ...baseOption,
          tooltip: {},
          legend: config.showLegend ? { data: ['指标'], textStyle: { color: '#fff' } } : undefined,
          radar: {
            indicator: chartData.slice(0, config.indicatorCount || 5).map((d: any) => ({
              name: d.name,
              max: Math.max(...chartData.map((x: any) => x.value)) * 1.2,
            })),
            axisName: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
            splitArea: { areaStyle: { color: ['transparent'] } },
          },
          series: [{
            type: 'radar',
            data: [{ value: chartData.map((d: any) => d.value), name: '指标' }],
            areaStyle: { color: colors[0] + '40' },
            lineStyle: { color: colors[0] },
            itemStyle: { color: colors[0] },
          }],
        };
        break;

      case 'scatter-chart':
        option = {
          ...baseOption,
          tooltip: {},
          legend: config.showLegend ? { data: ['散点'], textStyle: { color: '#fff' } } : undefined,
          xAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#4a5568' } },
            axisLabel: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
          },
          series: [{
            type: 'scatter',
            name: '散点',
            symbolSize: config.symbolSize || 20,
            data: chartData.map((d: any) => [d.value, Math.random() * 100, d.value]),
            itemStyle: {
              color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] },
              ]),
            },
          }],
        };
        break;

      case 'funnel-chart':
        option = {
          ...baseOption,
          tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}%' },
          legend: { data: chartData.map((d: any) => d.name), textStyle: { color: '#fff' } },
          series: [{
            type: 'funnel',
            name: '漏斗',
            sort: config.sort || 'descending',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: 100,
            gap: 2,
            label: config.showLabel !== false ? { show: true, position: 'inside', color: '#fff' } : { show: false },
            itemStyle: { borderColor: '#fff', borderWidth: 1 },
            data: chartData,
          }],
        };
        break;

      case 'gauge-chart':
        option = {
          ...baseOption,
          series: [{
            type: 'gauge',
            min: config.min || 0,
            max: config.max || 100,
            startAngle: config.startAngle || 225,
            endAngle: config.endAngle || -45,
            detail: { formatter: '{value}%', fontSize: 24, color: '#fff' },
            data: [{ value: chartData[0]?.value || 50, name: '指标' }],
            axisLine: { lineStyle: { width: 20, color: [[0.3, '#91cc75'], [0.7, '#fac858'], [1, '#ee6666']] } },
            pointer: { itemStyle: { color: 'auto' } },
            axisTick: { distance: -20, length: 8, lineStyle: { color: '#fff', width: 2 } },
            splitLine: { distance: -30, length: 30, lineStyle: { color: '#fff', width: 3 } },
            axisLabel: { color: '#a0aec0', distance: 40, fontSize: 12 },
            title: { color: '#fff', fontSize: 14 },
          }],
        };
        break;
    }

    chartInstance.setOption(option);

    const handleResize = () => chartInstance?.resize();
    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
      chartInstance?.dispose();
    });
  });

  return (
    <div
      ref={chartRef}
      style={{ width: `${props.component.width}px`, height: `${props.component.height}px` }}
    />
  );
}

function BasicComponent(props: { component: any }) {
  const { type, config, style } = props.component;

  const baseStyle = {
    'background-color': style.backgroundColor,
    'border-radius': `${style.borderRadius || 0}px`,
    opacity: style.opacity ?? 1,
    'border-color': style.borderColor,
    'border-width': `${style.borderWidth || 0}px`,
    'border-style': style.borderStyle || 'solid',
    padding: `${style.padding || 0}px`,
    color: style.color || '#ffffff',
    'font-family': style.fontFamily || 'system-ui',
    'text-align': style.textAlign || 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    overflow: 'hidden',
  };

  switch (type) {
    case 'text':
      return (
        <div style={baseStyle}>
          <span style={{
            'font-size': `${config.fontSize || 16}px`,
            'font-weight': config.fontWeight || 'normal',
            'text-align': config.align || 'left',
            width: '100%',
          }}>
            {config.content || '文本内容'}
          </span>
        </div>
      );

    case 'title':
      return (
        <div style={baseStyle}>
          <h2 style={{
            'font-size': `${config.fontSize || 24}px`,
            'font-weight': config.fontWeight || 'bold',
            margin: 0,
            'text-align': config.align || 'center',
            width: '100%',
          }}>
            {config.content || '标题文本'}
          </h2>
        </div>
      );

    case 'image':
      return (
        <div style={baseStyle}>
          {config.src ? (
            <img
              src={config.src}
              alt="组件图片"
              style={{
                width: '100%',
                height: '100%',
                'object-fit': config.objectFit || 'contain',
              }}
            />
          ) : (
            <div style={{ color: '#6b7280', 'font-size': '14px' }}>
              🖼️ 点击右侧设置图片地址
            </div>
          )}
        </div>
      );

    case 'rectangle':
      return (
        <div style={{
          ...baseStyle,
          'background-color': config.backgroundColor || style.backgroundColor || '#6366f1',
          'border-radius': `${config.borderRadius || 0}px`,
          opacity: config.opacity ?? 1,
        }} />
      );

    case 'border':
      return (
        <div style={{
          ...baseStyle,
          'border-width': `${config.borderWidth || 2}px`,
          'border-color': config.borderColor || '#818cf8',
          'border-style': config.borderStyle || 'solid',
          'border-radius': `${config.borderRadius || 0}px`,
        }} />
      );

    case 'table': {
      const columns = config.columns?.length > 0
        ? config.columns
        : Array.from({ length: 4 }, (_, i) => ({ key: `col${i}`, title: `列${i + 1}` }));
      const tableData = config.data?.length > 0
        ? config.data
        : Array.from({ length: 5 }, (_, i) =>
            columns.reduce((acc: any, col: any, j: number) => {
              acc[col.key] = `数据${i + 1}-${j + 1}`;
              return acc;
            }, {})
          );

      return (
        <div style={{ ...baseStyle, display: 'block', overflow: 'auto' }}>
          <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
            <thead>
              <tr>
                {columns.map((col: any) => (
                  <th style={{
                    'background-color': config.headerBackground || '#4f46e5',
                    color: config.headerColor || '#ffffff',
                    padding: '12px 16px',
                    'text-align': 'left',
                    'border-bottom': '1px solid #374151',
                    'font-weight': 600,
                  }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: any, i: number) => (
                <tr style={{
                  'background-color': config.stripe && i % 2 === 1 ? '#1e293b' : 'transparent',
                }}>
                  {columns.map((col: any) => (
                    <td style={{
                      padding: '10px 16px',
                      'border-bottom': '1px solid #334155',
                      color: '#e2e8f0',
                    }}>
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'progress':
      return (
        <div style={{
          ...baseStyle,
          'flex-direction': 'column' as const,
          gap: '8px',
        }}>
          {config.showInfo !== false && (
            <span style={{ 'font-size': '14px', color: '#a0aec0' }}>
              {config.percent || 75}%
            </span>
          )}
          <div style={{
            width: '100%',
            height: `${config.strokeWidth || 12}px`,
            'background-color': '#334155',
            'border-radius': '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${config.percent || 75}%`,
              height: '100%',
              'background-color': config.color || '#8b5cf6',
              'border-radius': '9999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      );

    case 'countup': {
      const formatNumber = (num: number, decimals: number = 0) => {
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };
      return (
        <div style={baseStyle}>
          <span style={{
            'font-size': '32px',
            'font-weight': 'bold',
            color: '#818cf8',
            'font-family': 'monospace',
          }}>
            {config.prefix || ''}{formatNumber(config.value || 0, config.decimals || 0)}{config.suffix || ''}
          </span>
        </div>
      );
    }

    default:
      return <div style={baseStyle}>未支持的组件类型</div>;
  }
}

export default function Preview() {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [dashboard, setDashboard] = createSignal<any>(null);

  createEffect(async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getById(Number(params.id));
      setDashboard(response.dashboard);
    } catch (err: any) {
      setError(err.message || '加载大屏失败');
      if (err.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  });

  const isChartComponent = (type: ComponentType) => {
    return !['text', 'title', 'image', 'rectangle', 'border', 'table', 'progress', 'countup'].includes(type);
  };

  return (
    <div class="min-h-screen bg-slate-900 flex flex-col">
      <div class="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <button
          onClick={() => navigate(`/editor/${params.id}`)}
          class="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          ← 返回编辑器
        </button>
        <h1 class="text-lg font-semibold text-white">
          {dashboard()?.name || '大屏预览'}
        </h1>
        <div class="w-24" />
      </div>

      <Show when={loading()}>
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-slate-300">加载中...</p>
          </div>
        </div>
      </Show>

      <Show when={error()}>
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center max-w-md">
            <div class="text-5xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold text-white mb-2">加载失败</h2>
            <p class="text-slate-400">{error()}</p>
          </div>
        </div>
      </Show>

      <Show when={dashboard() && !loading()}>
        <div class="flex-1 flex items-center justify-center overflow-auto p-8">
          <div
            class="relative shadow-2xl"
            style={{
              width: `${dashboard()?.config?.width || 1920}px`,
              height: `${dashboard()?.config?.height || 1080}px`,
              'background-color': dashboard()?.config?.backgroundColor || '#0f172a',
              transform: `scale(${Math.min(
                (window.innerWidth - 100) / (dashboard()?.config?.width || 1920),
                (window.innerHeight - 150) / (dashboard()?.config?.height || 1080),
                1
              )})`,
              'transform-origin': 'center center',
            }}
          >
            <For each={dashboard()?.config?.components || []}>
              {(component: any) => (
                <div
                  style={{
                    position: 'absolute',
                    left: `${component.x}px`,
                    top: `${component.y}px`,
                    width: `${component.width}px`,
                    height: `${component.height}px`,
                    'z-index': component.zIndex || 0,
                    overflow: 'hidden',
                  }}
                >
                  {isChartComponent(component.type) ? (
                    <ChartComponent component={component} />
                  ) : (
                    <BasicComponent component={component} />
                  )}
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
