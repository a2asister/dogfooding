import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Modal, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { appApi, App, AppMetric } from '../api';

export default function AppMonitor() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [env, setEnv] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [metrics, setMetrics] = useState<AppMetric[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await appApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        env,
      });
      setApps(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [pagination.current, pagination.pageSize, keyword, env]);

  const handleViewMetrics = async (app: App) => {
    setSelectedApp(app);
    const data = await appApi.getMetrics(app.code, {
      startTime: dayjs().subtract(1, 'hour').toISOString(),
    });
    setMetrics(data);
  };

  const columns = [
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '应用编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="geekblue">{type}</Tag>,
    },
    {
      title: '环境',
      dataIndex: 'env',
      key: 'env',
      render: (env: string) => <Tag color="blue">{env}</Tag>,
    },
    {
      title: '实例数',
      dataIndex: 'instanceCount',
      key: 'instanceCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'running' ? 'success' : 'error'}>
          <span className={`status-dot status-${status}`} /> {status === 'running' ? '运行中' : '已停止'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: App) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewMetrics(record)}>
            查看指标
          </Button>
        </Space>
      ),
    },
  ];

  const getChartOption = (key: keyof AppMetric, title: string, color: string, unit = '') => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: metrics.map((m) => dayjs(m.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', axisLabel: { formatter: `{value}${unit}` } },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: metrics.map((m) => m[key]),
        color,
      },
    ],
  });

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="搜索应用名称/编码"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 240 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="选择环境"
              value={env || undefined}
              onChange={(v) => setEnv(v)}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="dev">开发环境</Select.Option>
              <Select.Option value="test">测试环境</Select.Option>
              <Select.Option value="pre">预发布环境</Select.Option>
              <Select.Option value="prod">生产环境</Select.Option>
            </Select>
          </Col>
          <Col flex="auto">
            <Button icon={<ReloadOutlined />} onClick={loadApps} style={{ float: 'right' }}>
              刷新
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={apps}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title="应用指标详情"
        open={!!selectedApp}
        onCancel={() => setSelectedApp(null)}
        footer={null}
        width={1200}
      >
        {selectedApp && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>{selectedApp.name}</strong> ({selectedApp.code})
              <Tag style={{ marginLeft: 8 }}>{selectedApp.type}</Tag>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ReactECharts option={getChartOption('cpuUsage', 'CPU 使用率', '#1890ff', '%')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('memoryUsage', '内存使用率', '#52c41a', '%')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('requestCount', '请求数', '#722ed1', '')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('errorRate', '错误率', '#eb2f96', '%')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('avgResponseTime', '平均响应时间', '#faad14', 'ms')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('p95ResponseTime', 'P95 响应时间', '#13c2c2', 'ms')} style={{ height: 220 }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
