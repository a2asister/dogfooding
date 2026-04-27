import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useTrafficStore } from '@/store/trafficStore';
import type { TrafficFlowData } from '@/types';
import styles from './TrafficFlow.module.css';

interface ChartData {
  hour: string;
  volume: number;
  speed: number;
}

function formatHour(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}

function TrafficFlowChart({ data, title }: { data: TrafficFlowData[]; title: string }) {
  const chartData: ChartData[] = data.map((item) => ({
    hour: formatHour(item.timestamp),
    volume: item.volume,
    speed: item.avgSpeed,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="hour"
            stroke="#9ca3af"
            fontSize={10}
            tickLine={false}
          />
          <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            fill="url(#volumeGradient)"
            name="车流量"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpeedChart({ data, title }: { data: TrafficFlowData[]; title: string }) {
  const chartData: ChartData[] = data.map((item) => ({
    hour: formatHour(item.timestamp),
    volume: item.volume,
    speed: item.avgSpeed,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="hour"
            stroke="#9ca3af"
            fontSize={10}
            tickLine={false}
          />
          <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name="车速 (km/h)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PeakAnalysis({ data }: { data: TrafficFlowData[] }) {
  const analysis = useMemo(() => {
    const morningPeak = data
      .filter((d) => {
        const hour = new Date(d.timestamp).getHours();
        return hour >= 7 && hour <= 9;
      })
      .reduce((sum, d) => sum + d.volume, 0);

    const eveningPeak = data
      .filter((d) => {
        const hour = new Date(d.timestamp).getHours();
        return hour >= 17 && hour <= 19;
      })
      .reduce((sum, d) => sum + d.volume, 0);

    const offPeak = data
      .filter((d) => {
        const hour = new Date(d.timestamp).getHours();
        return (hour >= 10 && hour <= 16) || (hour >= 20 && hour <= 23) || (hour >= 0 && hour <= 6);
      })
      .reduce((sum, d) => sum + d.volume, 0);

    const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
    const maxVolume = Math.max(...data.map((d) => d.volume));
    const minVolume = Math.min(...data.map((d) => d.volume));

    return {
      morningPeak: Math.round(morningPeak / (morningPeak > 0 ? 3 : 1)),
      eveningPeak: Math.round(eveningPeak / (eveningPeak > 0 ? 3 : 1)),
      offPeak: Math.round(offPeak / (offPeak > 0 ? (24 - 6) : 1)),
      avgVolume: Math.round(avgVolume),
      maxVolume,
      minVolume,
    };
  }, [data]);

  return (
    <div className={styles.analysisContainer}>
      <h3 className={styles.chartTitle}>高峰分析</h3>
      <div className={styles.analysisGrid}>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>早高峰均量</span>
          <span className={styles.analysisValue}>{analysis.morningPeak}</span>
        </div>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>晚高峰均量</span>
          <span className={styles.analysisValue}>{analysis.eveningPeak}</span>
        </div>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>平峰均量</span>
          <span className={styles.analysisValue}>{analysis.offPeak}</span>
        </div>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>最大流量</span>
          <span className={`${styles.analysisValue} ${styles.warning}`}>{analysis.maxVolume}</span>
        </div>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>最小流量</span>
          <span className={styles.analysisValue}>{analysis.minVolume}</span>
        </div>
        <div className={styles.analysisItem}>
          <span className={styles.analysisLabel}>平均流量</span>
          <span className={styles.analysisValue}>{analysis.avgVolume}</span>
        </div>
      </div>
    </div>
  );
}

export function TrafficFlow() {
  const roads = useTrafficStore((state) => state.roads);
  const trafficFlowData = useTrafficStore((state) => state.trafficFlowData);
  const [selectedRoad, setSelectedRoad] = useState<string>(roads[0]?.id || '');

  const currentRoadData = useMemo(() => {
    return trafficFlowData.get(selectedRoad) || [];
  }, [trafficFlowData, selectedRoad]);

  const anomalyAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (currentRoadData.length > 0) {
      const avgVolume =
        currentRoadData.reduce((sum, d) => sum + d.volume, 0) / currentRoadData.length;
      const maxVolume = Math.max(...currentRoadData.map((d) => d.volume));
      if (maxVolume > avgVolume * 2) {
        alerts.push('检测到车流暴涨异常');
      }
      if (avgVolume > 0) {
        const recentData = currentRoadData.slice(-6);
        const recentAvg =
          recentData.reduce((sum, d) => sum + d.volume, 0) / recentData.length;
        if (recentAvg < avgVolume * 0.3) {
          alerts.push('检测到车流滞留异常');
        }
      }
    }
    return alerts;
  }, [currentRoadData]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>车流监测统计</h2>

      <div className={styles.selector}>
        <label className={styles.selectorLabel}>选择路段:</label>
        <select
          className={styles.select}
          value={selectedRoad}
          onChange={(e) => setSelectedRoad(e.target.value)}
        >
          {roads.map((road) => (
            <option key={road.id} value={road.id}>
              {road.name}
            </option>
          ))}
        </select>
      </div>

      {anomalyAlerts.length > 0 && (
        <div className={styles.alerts}>
          {anomalyAlerts.map((alert, index) => (
            <div key={index} className={styles.alertItem}>
              ⚠️ {alert}
            </div>
          ))}
        </div>
      )}

      <div className={styles.chartsGrid}>
        <TrafficFlowChart
          data={currentRoadData}
          title={`${roads.find((r) => r.id === selectedRoad)?.name || ''} 车流量变化`}
        />
        <SpeedChart
          data={currentRoadData}
          title="通行速度曲线"
        />
        <PeakAnalysis data={currentRoadData} />
      </div>
    </div>
  );
}