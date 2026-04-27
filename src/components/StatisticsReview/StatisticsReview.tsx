import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useTrafficStore, hasPermission } from '@/store/trafficStore';
import styles from './StatisticsReview.module.css';

export function StatisticsReview() {
  const statistics = useTrafficStore((state) => state.statistics);
  const currentUser = useTrafficStore((state) => state.currentUser);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: statistics[statistics.length - 7]?.date || '',
    end: statistics[0]?.date || '',
  });

  const canExport = hasPermission(currentUser, 'config');

  const filteredData = useMemo(() => {
    return statistics.filter(
      (stat) => stat.date >= dateRange.start && stat.date <= dateRange.end
    );
  }, [statistics, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, stat) => ({
        totalTrafficVolume: acc.totalTrafficVolume + stat.totalTrafficVolume,
        congestionDuration: acc.congestionDuration + stat.congestionDuration,
        alarmCount: acc.alarmCount + stat.alarmCount,
        deviceFaultCount: acc.deviceFaultCount + stat.deviceFaultCount,
        signalSchedulingCount: acc.signalSchedulingCount + stat.signalSchedulingCount,
      }),
      {
        totalTrafficVolume: 0,
        congestionDuration: 0,
        alarmCount: 0,
        deviceFaultCount: 0,
        signalSchedulingCount: 0,
      }
    );
  }, [filteredData]);

  const handleExport = () => {
    if (!canExport) return;
    const csvContent = [
      ['日期', '车流量', '拥堵时长(分钟)', '告警次数', '设备故障', '信号调度次数'],
      ...filteredData.map((stat) => [
        stat.date,
        stat.totalTrafficVolume,
        stat.congestionDuration,
        stat.alarmCount,
        stat.deviceFaultCount,
        stat.signalSchedulingCount,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `交通数据报表_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>数据统计复盘</h2>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>
            {totals.totalTrafficVolume.toLocaleString()}
          </span>
          <span className={styles.summaryLabel}>总车流量</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>
            {Math.round(totals.congestionDuration / 60)}h
          </span>
          <span className={styles.summaryLabel}>总拥堵时长</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{totals.alarmCount}</span>
          <span className={styles.summaryLabel}>总告警次数</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{totals.deviceFaultCount}</span>
          <span className={styles.summaryLabel}>设备故障数</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{totals.signalSchedulingCount}</span>
          <span className={styles.summaryLabel}>信号调度次数</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateRange}>
          <label>
            开始日期:
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((r) => ({ ...r, start: e.target.value }))
              }
            />
          </label>
          <label>
            结束日期:
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
            />
          </label>
        </div>
        {canExport && (
          <button className={styles.exportButton} onClick={handleExport}>
            导出数据
          </button>
        )}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>每日车流量</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="totalTrafficVolume" fill="#3b82f6" name="车流量" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>每日告警与故障统计</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
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
                dataKey="alarmCount"
                stroke="#f59e0b"
                strokeWidth={2}
                name="告警次数"
              />
              <Line
                type="monotone"
                dataKey="deviceFaultCount"
                stroke="#ef4444"
                strokeWidth={2}
                name="设备故障"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>每日拥堵时长</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar
                dataKey="congestionDuration"
                fill="#ef4444"
                name="拥堵时长(分钟)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>信号调度次数</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
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
                dataKey="signalSchedulingCount"
                stroke="#22c55e"
                strokeWidth={2}
                name="调度次数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}