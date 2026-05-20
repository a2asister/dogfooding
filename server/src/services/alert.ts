import * as cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { AlertRule } from '../entity/AlertRule';
import { AlertRecord } from '../entity/AlertRecord';
import { HostMetric } from '../entity/HostMetric';
import { ContainerMetric } from '../entity/ContainerMetric';
import { AppMetric } from '../entity/AppMetric';

interface MetricValue {
  value: number;
  targetType: string;
  targetId: string;
}

function evaluateCondition(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>':
      return value > threshold;
    case '>=':
      return value >= threshold;
    case '<':
      return value < threshold;
    case '<=':
      return value <= threshold;
    case '==':
      return value === threshold;
    case '!=':
      return value !== threshold;
    default:
      return false;
  }
}

async function getLatestMetricValues(metric: string): Promise<MetricValue[]> {
  const values: MetricValue[] = [];
  const hostMetricMap: Record<string, keyof HostMetric> = {
    cpu_usage: 'cpuUsage',
    memory_usage: 'memoryUsage',
    disk_usage: 'diskUsage',
    network_in: 'networkIn',
    network_out: 'networkOut',
    load_average: 'loadAverage',
  };
  const containerMetricMap: Record<string, keyof ContainerMetric> = {
    container_cpu_usage: 'cpuUsage',
    container_memory_usage: 'memoryUsage',
    container_restart_count: 'restartCount',
  };
  const appMetricMap: Record<string, keyof AppMetric> = {
    app_cpu_usage: 'cpuUsage',
    app_memory_usage: 'memoryUsage',
    error_rate: 'errorRate',
    avg_response_time: 'avgResponseTime',
    p95_response_time: 'p95ResponseTime',
    p99_response_time: 'p99ResponseTime',
  };
  if (hostMetricMap[metric]) {
    const hostMetricRepository = AppDataSource.getRepository(HostMetric);
    const latestMetrics = await hostMetricRepository
      .createQueryBuilder('m')
      .innerJoin((subQuery) => {
        return subQuery
          .select('MAX(timestamp)', 'max_time')
          .addSelect('hostId')
          .from(HostMetric, 'm2')
          .groupBy('m2.hostId');
      }, 'latest', 'm.hostId = latest.hostId AND m.timestamp = latest.max_time')
      .getMany();
    for (const m of latestMetrics) {
      const field = hostMetricMap[metric];
      const value = m[field] as unknown as number;
      if (typeof value === 'number') {
        values.push({ value, targetType: 'host', targetId: String(m.hostId) });
      }
    }
  } else if (containerMetricMap[metric]) {
    const containerMetricRepository = AppDataSource.getRepository(ContainerMetric);
    const latestMetrics = await containerMetricRepository
      .createQueryBuilder('m')
      .innerJoin((subQuery) => {
        return subQuery
          .select('MAX(timestamp)', 'max_time')
          .addSelect('containerId')
          .from(ContainerMetric, 'm2')
          .groupBy('m2.containerId');
      }, 'latest', 'm.containerId = latest.containerId AND m.timestamp = latest.max_time')
      .getMany();
    for (const m of latestMetrics) {
      const field = containerMetricMap[metric];
      const value = m[field] as unknown as number;
      if (typeof value === 'number') {
        values.push({ value, targetType: 'container', targetId: m.containerId });
      }
    }
  } else if (appMetricMap[metric]) {
    const appMetricRepository = AppDataSource.getRepository(AppMetric);
    const latestMetrics = await appMetricRepository
      .createQueryBuilder('m')
      .innerJoin((subQuery) => {
        return subQuery
          .select('MAX(timestamp)', 'max_time')
          .addSelect('appCode')
          .from(AppMetric, 'm2')
          .groupBy('m2.appCode');
      }, 'latest', 'm.appCode = latest.appCode AND m.timestamp = latest.max_time')
      .getMany();
    for (const m of latestMetrics) {
      const field = appMetricMap[metric];
      const value = m[field] as unknown as number;
      if (typeof value === 'number') {
        values.push({ value, targetType: 'app', targetId: m.appCode });
      }
    }
  }
  return values;
}

async function checkAlertRules() {
  try {
    const ruleRepository = AppDataSource.getRepository(AlertRule);
    const recordRepository = AppDataSource.getRepository(AlertRecord);
    const rules = await ruleRepository.find({ where: { enabled: true } });
    for (const rule of rules) {
      const metricValues = await getLatestMetricValues(rule.metric);
      for (const metricValue of metricValues) {
        if (evaluateCondition(metricValue.value, rule.operator, rule.threshold)) {
          const existingRecord = await recordRepository.findOne({
            where: {
              ruleId: rule.id,
              targetType: metricValue.targetType,
              targetId: metricValue.targetId,
              status: 'pending',
            },
          });
          if (!existingRecord) {
            const record = recordRepository.create({
              ruleId: rule.id,
              ruleName: rule.name,
              metric: rule.metric,
              currentValue: metricValue.value,
              threshold: rule.threshold,
              operator: rule.operator,
              level: rule.level,
              targetType: metricValue.targetType,
              targetId: metricValue.targetId,
              details: `${metricValue.targetType} ${metricValue.targetId} ${rule.metric} = ${metricValue.value} ${rule.operator} ${rule.threshold}`,
              status: 'pending',
            });
            await recordRepository.save(record);
            console.log(`Alert triggered: ${rule.name} - ${metricValue.value} ${rule.operator} ${rule.threshold}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error checking alert rules:', err);
  }
}

export function initAlertChecker() {
  checkAlertRules();
  cron.schedule('0 * * * * *', () => {
    checkAlertRules();
  });
  console.log('Alert checker initialized');
}
