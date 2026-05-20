import { useState, useEffect } from 'react';
import { Row, Col, Card, Progress, List, Tag, Space } from 'antd';
import {
  DesktopOutlined,
  CloudServerOutlined,
  AppstoreOutlined,
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { hostApi, containerApi, appApi, alertApi, Host, HostMetric } from '../api';

export default function Dashboard() {
  const [hostStats, setHostStats] = useState<any>({});
  const [containerStats, setContainerStats] = useState<any>({});
  const [appStats, setAppStats] = useState<any>({});
  const [alertStats, setAlertStats] = useState<any>({});
  const [hosts, setHosts] = useState<Host[]>([]);
  const [metrics, setMetrics] = useState<HostMetric[]>([]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    const [hs, cs, as, als, hl] = await Promise.all([
      hostApi.getOverview(),
      containerApi.getOverview(),
      appApi.getOverview(),
      alertApi.getOverview(),
      hostApi.getAll(),
    ]);
    setHostStats(hs);
    setContainerStats(cs);
    setAppStats(as);
    setAlertStats(als);
    setHosts(hl);
    if (hl && hl.length > 0) {
      const m = await hostApi.getMetrics(hl[0].id, {
        startTime: dayjs().subtract(1, 'hour').toISOString(),
      });
      setMetrics(m);
    }
  };

  const cpuChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: metrics.map((m) => dayjs(m.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: metrics.map((m) => m.cpuUsage),
        color: '#1890ff',
      },
    ],
  };

  const memoryChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: metrics.map((m) => dayjs(m.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: metrics.map((m) => m.memoryUsage),
        color: '#52c41a',
      },
    ],
  };

  const statCards = [
    {
      title: '主机总数',
      value: hostStats.total || 0,
      icon: <DesktopOutlined style={{ color: '#1890ff', fontSize: 32 }} />,
      sub: (
        <Space>
          <Tag color="success">{hostStats.online || 0} 在线</Tag>
          <Tag color="error">{hostStats.offline || 0} 离线</Tag>
        </Space>
      ),
    },
    {
      title: '容器总数',
      value: containerStats.total || 0,
      icon: <CloudServerOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
      sub: (
        <Space>
          <Tag color="success">{containerStats.running || 0} 运行中</Tag>
          <Tag color="default">{containerStats.stopped || 0} 已停止</Tag>
        </Space>
      ),
    },
    {
      title: '应用总数',
      value: appStats.total || 0,
      icon: <AppstoreOutlined style={{ color: '#722ed1', fontSize: 32 }} />,
      sub: (
        <Space>
          <Tag color="success">{appStats.running || 0} 运行中</Tag>
          <Tag color="default">{appStats.stopped || 0} 已停止</Tag>
        </Space>
      ),
    },
    {
      title: '告警总数',
      value: (alertStats.pending || 0) + (alertStats.processing || 0),
      icon: <BellOutlined style={{ color: '#faad14', fontSize: 32 }} />,
      sub: (
        <Space>
          <Tag color="error">{alertStats.critical || 0} 严重</Tag>
          <Tag color="warning">{alertStats.warning || 0} 警告</Tag>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="label">{card.title}</div>
                  <div className="value">{card.value}</div>
                  <div className="trend">{card.sub}</div>
                </div>
                {card.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card className="chart-card">
            <div className="chart-title">CPU 使用率趋势</div>
            <ReactECharts option={cpuChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="chart-card">
            <div className="chart-title">内存使用率趋势</div>
            <ReactECharts option={memoryChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card className="chart-card" title="主机状态列表">
            <List
              dataSource={hosts.slice(0, 5)}
              renderItem={(host) => (
                <List.Item key={host.id}>
                  <List.Item.Meta
                    avatar={
                      host.status === 'online' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                      ) : (
                        <WarningOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                      )
                    }
                    title={host.hostname}
                    description={host.ip}
                  />
                  <Space>
                    <Tag color="blue">{host.env}</Tag>
                    <Progress
                      type="dashboard"
                      percent={Math.floor(Math.random() * 40 + 30)}
                      width={40}
                      size="small"
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="chart-card" title="资源使用率概览">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {hosts.slice(0, 4).map((host) => (
                <div key={host.id}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{host.hostname}</span>
                    <span style={{ color: '#8c8c8c' }}>{host.ip}</span>
                  </div>
                  <Progress percent={Math.floor(Math.random() * 40 + 30)} size="small" />
                  <Progress percent={Math.floor(Math.random() * 40 + 30)} size="small" strokeColor="#52c41a" />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
