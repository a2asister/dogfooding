import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  GithubOutlined,
  CodeOutlined,
  RocketOutlined,
  BellOutlined,
  PullRequestOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '@/api';
import type { DashboardStats } from '@/types';

function Dashboard(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data as DashboardStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const pipelineChartOption = {
    title: { text: 'CI流水线执行趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['成功', '失败', '运行中'], bottom: 0 },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '成功', type: 'bar', stack: 'total', data: [12, 15, 18, 22, 19, 8, 5], itemStyle: { color: '#52c41a' } },
      { name: '失败', type: 'bar', stack: 'total', data: [2, 1, 3, 1, 2, 1, 0], itemStyle: { color: '#ff4d4f' } },
      { name: '运行中', type: 'bar', stack: 'total', data: [3, 2, 4, 2, 3, 1, 1], itemStyle: { color: '#1890ff' } },
    ],
  };

  const deploymentChartOption = {
    title: { text: '环境部署统计', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 45, name: '开发环境', itemStyle: { color: '#1890ff' } },
          { value: 32, name: '测试环境', itemStyle: { color: '#faad14' } },
          { value: 18, name: '预发环境', itemStyle: { color: '#722ed1' } },
          { value: 12, name: '生产环境', itemStyle: { color: '#52c41a' } },
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="代码仓库"
              value={stats?.pullRequests.totalPRs || 0}
              prefix={<GithubOutlined style={{ color: '#1890ff' }} />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="CI流水线"
              value={stats?.pipelines.totalPipelines || 0}
              prefix={<CodeOutlined style={{ color: '#722ed1' }} />}
              suffix="条"
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> 成功率 {stats?.pipelines.successRate || 0}%</span>
              <span style={{ color: '#1890ff' }}><SyncOutlined spin={stats?.pipelines.runningCount !== undefined && stats.pipelines.runningCount > 0} /> 运行中 {stats?.pipelines.runningCount || 0}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日执行"
              value={stats?.pipelines.todayRuns || 0}
              prefix={<RocketOutlined style={{ color: '#52c41a' }} />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理告警"
              value={stats?.alerts.unreadCount || 0}
              prefix={<BellOutlined style={{ color: '#faad14' }} />}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="待审核PR"
              value={stats?.pullRequests.openPRs || 0}
              prefix={<PullRequestOutlined style={{ color: '#fa8c16' }} />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="已合并PR"
              value={stats?.pullRequests.mergedPRs || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="活跃环境"
              value={stats?.deployments.activeEnvironments || 0}
              prefix={<ClockCircleOutlined style={{ color: '#13c2c2' }} />}
              suffix="个"
            />
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <span style={{ color: '#52c41a' }}>部署成功率 {stats?.deployments.successRate || 0}%</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card>
            <ReactECharts option={pipelineChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card>
            <ReactECharts option={deploymentChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
