import { createEffect, onCleanup } from 'solid-js';
import * as echarts from 'echarts';
import { generateMockData, generatePieData } from '../utils/mockData';
import type { ComponentInstance } from '../types';

interface ChartRendererProps {
  component: ComponentInstance;
  width: number;
  height: number;
}

export default function ChartRenderer(props: ChartRendererProps) {
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

  const getOption = (): echarts.EChartsOption => {
    const { type, config, style } = props.component;
    const chartData = getChartData();
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
      animation: props.component.animation.enabled,
      animationDuration: props.component.animation.duration,
      animationEasing: props.component.animation.easing as any,
    };

    switch (type) {
      case 'line-chart':
        return {
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
          series: [
            {
              name: '数值',
              type: 'line',
              data: chartData.map((d: any) => d.value),
              smooth: config.smooth,
              showSymbol: config.showSymbol,
              lineStyle: { width: 3, color: colors[0] },
              itemStyle: { color: colors[0] },
              areaStyle: config.areaStyle ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[0] + '80' },
                { offset: 1, color: colors[0] + '00' },
              ]) } : undefined,
            },
          ],
        };

      case 'bar-chart':
        return {
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
          series: [
            {
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
            },
          ],
        };

      case 'pie-chart':
        return {
          ...baseOption,
          tooltip: { trigger: 'item' },
          legend: config.showLegend !== false ? { orient: 'vertical', left: 'left', textStyle: { color: '#fff' } } : undefined,
          series: [
            {
              type: 'pie',
              radius: config.radius || ['40%', '70%'],
              roseType: config.roseType ? 'radius' : undefined,
              data: chartData,
              label: config.showLabel !== false ? { color: '#fff' } : { show: false },
              emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            },
          ],
        };

      case 'radar-chart':
        return {
          ...baseOption,
          tooltip: {},
          legend: config.showLegend ? { data: ['指标'], textStyle: { color: '#fff' } } : undefined,
          radar: {
            indicator: chartData.slice(0, config.indicatorCount || 5).map((d: any, i: number) => ({
              name: d.name || `指标${i + 1}`,
              max: Math.max(...chartData.map((x: any) => x.value)) * 1.2,
            })),
            axisName: { color: '#a0aec0' },
            splitLine: { lineStyle: { color: '#2d3748' } },
            splitArea: { areaStyle: { color: ['transparent'] } },
          },
          series: [
            {
              type: 'radar',
              data: [{ value: chartData.map((d: any) => d.value), name: '指标' }],
              areaStyle: { color: colors[0] + '40' },
              lineStyle: { color: colors[0] },
              itemStyle: { color: colors[0] },
            },
          ],
        };

      case 'area-chart':
        return {
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
          series: [
            {
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
            },
          ],
        };

      case 'scatter-chart':
        return {
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
          series: [
            {
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
            },
          ],
        };

      case 'funnel-chart':
        return {
          ...baseOption,
          tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}%' },
          legend: { data: chartData.map((d: any) => d.name), textStyle: { color: '#fff' } },
          series: [
            {
              type: 'funnel',
              name: '漏斗',
              sort: config.sort || 'descending',
              left: '10%',
              top: 60,
              bottom: 60,
              width: '80%',
              min: 0,
              max: 100,
              minSize: '0%',
              maxSize: '100%',
              gap: 2,
              label: config.showLabel !== false ? { show: true, position: 'inside', color: '#fff' } : { show: false },
              labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
              itemStyle: { borderColor: '#fff', borderWidth: 1 },
              emphasis: { label: { fontSize: 20 } },
              data: chartData,
            },
          ],
        };

      case 'gauge-chart':
        return {
          ...baseOption,
          series: [
            {
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
            },
          ],
        };

      default:
        return baseOption;
    }
  };

  createEffect(() => {
    if (chartRef) {
      chartInstance = echarts.init(chartRef);
      chartInstance.setOption(getOption());

      const handleResize = () => {
        chartInstance?.resize();
      };
      window.addEventListener('resize', handleResize);

      onCleanup(() => {
        window.removeEventListener('resize', handleResize);
        chartInstance?.dispose();
      });
    }
  });

  createEffect(() => {
    if (chartInstance) {
      chartInstance.setOption(getOption(), true);
    }
  });

  return (
    <div
      ref={chartRef}
      style={{ width: `${props.width}px`, height: `${props.height}px` }}
    />
  );
}
