import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Button, DatePicker, Modal, Statistic, Empty, Tabs, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, ThunderboltOutlined, ClockCircleOutlined, BugOutlined, RiseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { traceApi, ApiMetric } from '../api';

const { RangePicker } = DatePicker;

const methodColors: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'cyan',
};

export default function ApiMetrics() {
  const [metrics, setMetrics] = useState<ApiMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [appCode, setAppCode] = useState('');
  const [path, setPath] = useState('');
  const [env, setEnv] = useState('prod');
  const [timeRange, setTimeRange] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<ApiMetric | null>(null);
  const [chartData, setChartData] = useState<ApiMetric[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [topSlow, setTopSlow] = useState<ApiMetric[]>([]);
  const [topError, setTopError] = useState<ApiMetric[]>([]);
  const [topQps, setTopQps] = useState<ApiMetric[]>([]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        appCode,
        env,
        path,
      };
      if (timeRange && timeRange.length === 2) {
        params.startTime = timeRange[0].toISOString();
        params.endTime = timeRange[1].toISOString();
      }
      const data = await traceApi.getApiMetrics(params);
      setMetrics(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  const loadTopData = async () => {
    try {
      const [slowData, errorData, qpsData] = await Promise.all([
        traceApi.getTopSlowApi({ env, limit: 10 }),
        traceApi.getTopErrorApi({ env, limit: 10 }),
        traceApi.getTopQpsApi({ env, limit: 10 }),
      ]);
      setTopSlow(slowData);
      setTopError(errorData);
      setTopQps(qpsData);
    } catch (err) {
      console.error('Failed to load top data:', err);
    }
  };

  useEffect(() => {
    loadMetrics();
    loadTopData();
  }, [pagination.current, pagination.pageSize, env]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadMetrics();
    loadTopData();
  };

  const handleViewChart = async (metric: ApiMetric) => {
    setSelectedMetric(metric);
    const data = await traceApi.getApiMetricChart({
      appCode: metric.appCode,
      env: metric.env,
      path: metric.path,
    });
    setChartData(data);
  };

  const getDurationColor = (duration: number) => {
    if (duration > 1000) return 'red';
    if (duration > 500) return 'orange';
    if (duration > 200) return 'gold';
    return 'green';
  };

  const getChartOption = (key: keyof ApiMetric, title: string, color: string, unit = '') => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map((m) => dayjs(m.timestamp).format('HH:mm:ss')),
    },
    yAxis: { type: 'value', axisLabel: { formatter: `{value}${unit}` } },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: chartData.map((m) => m[key]),
        color,
      },
    ],
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '应用',
      dataIndex: 'appCode',
      key: 'appCode',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '环境',
      dataIndex: 'env',
      key: 'env',
      width: 80,
      render: (env: string) => {
        const colors: Record<string, string> = { prod: 'red', pre: 'orange', test: 'blue', dev: 'green' };
        return <Tag color={colors[env] || 'default'}>{env}</Tag>;
      },
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (m: string) => <Tag color={methodColors[m] || 'default'}>{m}</Tag>,
    },
    {
      title: '接口路径',
      dataIndex: 'path',
      key: 'path',
      width: 250,
      ellipsis: true,
      render: (p: string) => <Tooltip title={p}><span>{p}</span></Tooltip>,
    },
    {
      title: 'QPS',
      dataIndex: 'qps',
      key: 'qps',
      width: 100,
      render: (q: number) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>{q.toFixed(1)}</span>
      ),
      sorter: (a: ApiMetric, b: ApiMetric) => a.qps - b.qps,
    },
    {
      title: '请求数',
      dataIndex: 'requestCount',
      key: 'requestCount',
      width: 100,
      sorter: (a: ApiMetric, b: ApiMetric) => a.requestCount - b.requestCount,
    },
    {
      title: '成功数',
      dataIndex: 'successCount',
      key: 'successCount',
      width: 100,
      render: (c: number) => <span style={{ color: '#52c41a' }}>{c}</span>,
    },
    {
      title: '错误数',
      dataIndex: 'errorCount',
      key: 'errorCount',
      width: 100,
      render: (c: number) => (c > 0 ? <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{c}</span> : c),
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 100,
      render: (r: number) => (
        <Tag color={r > 5 ? 'error' : r > 1 ? 'warning' : 'success'}>{r.toFixed(2)}%</Tag>
      ),
      sorter: (a: ApiMetric, b: ApiMetric) => a.errorRate - b.errorRate,
    },
    {
      title: '平均耗时',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      width: 110,
      render: (d: number) => <Tag color={getDurationColor(d)}>{d}ms</Tag>,
      sorter: (a: ApiMetric, b: ApiMetric) => a.avgDuration - b.avgDuration,
    },
    {
      title: 'P95耗时',
      dataIndex: 'p95Duration',
      key: 'p95Duration',
      width: 110,
      render: (d: number) => <Tag color={getDurationColor(d)}>{d}ms</Tag>,
    },
    {
      title: 'P99耗时',
      dataIndex: 'p99Duration',
      key: 'p99Duration',
      width: 110,
      render: (d: number) => <Tag color={getDurationColor(d)}>{d}ms</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ApiMetric) => (
        <Button type="link" size="small" onClick={() => handleViewChart(record)}>
          趋势
        </Button>
      ),
    },
  ];

  const rankColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => {
        const colors = ['#faad14', '#d9d9d9', '#d48806'];
        return index < 3 ? (
          <Tag color={colors[index]} style={{ fontSize: 14, fontWeight: 'bold' }}>
            #{index + 1}
          </Tag>
        ) : (
          <span style={{ color: '#999' }}>#{index + 1}</span>
        );
      },
    },
    {
      title: '接口',
      key: 'api',
      render: (_: any, record: ApiMetric) => (
        <Space>
          <Tag color={methodColors[record.method]}>{record.method}</Tag>
          <span style={{ fontSize: 12 }}>{record.path}</span>
        </Space>
      ),
    },
    {
      title: '数值',
      key: 'value',
      width: 100,
      align: 'right' as const,
      render: (_: any, record: ApiMetric, index: number) => {
        const key = index === 0 ? 'avgDuration' : index === 1 ? 'errorRate' : 'qps';
        const value = record[key as keyof ApiMetric] as number;
        const suffix = index === 1 ? '%' : index === 2 ? '' : 'ms';
        return <strong>{value.toFixed(2)}{suffix}</strong>;
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="接口总数"
              value={metrics.length}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总请求数"
              value={metrics.reduce((sum, m) => sum + m.requestCount, 0)}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均QPS"
              value={metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.qps, 0) / metrics.length).toFixed(1) : 0}
              suffix="/s"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常接口"
              value={metrics.filter((m) => m.errorCount > 0).length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }} title="TOP 排行">
        <Row gutter={16}>
          <Col span={8}>
            <h4 style={{ marginBottom: 12 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> TOP 10 慢接口
            </h4>
            {topSlow.length > 0 ? (
              <Table
                dataSource={topSlow}
                columns={rankColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Col>
          <Col span={8}>
            <h4 style={{ marginBottom: 12 }}>
              <BugOutlined style={{ color: '#ff4d4f' }} /> TOP 10 高错误率
            </h4>
            {topError.length > 0 ? (
              <Table
                dataSource={topError}
                columns={rankColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Col>
          <Col span={8}>
            <h4 style={{ marginBottom: 12 }}>
              <ThunderboltOutlined style={{ color: '#1890ff' }} /> TOP 10 高QPS
            </h4>
            {topQps.length > 0 ? (
              <Table
                dataSource={topQps}
                columns={rankColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Col>
        </Row>
      </Card>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="选择应用"
              value={appCode || undefined}
              onChange={(v) => setAppCode(v)}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="user-service">用户中心服务</Select.Option>
              <Select.Option value="order-service">订单服务</Select.Option>
              <Select.Option value="payment-gateway">支付网关</Select.Option>
              <Select.Option value="mq-service">消息队列服务</Select.Option>
              <Select.Option value="admin-web">管理后台</Select.Option>
            </Select>
          </Col>
          <Col>
            <Input
              placeholder="接口路径"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="选择环境"
              value={env}
              onChange={setEnv}
              style={{ width: 120 }}
            >
              <Select.Option value="dev">开发</Select.Option>
              <Select.Option value="test">测试</Select.Option>
              <Select.Option value="pre">预发布</Select.Option>
              <Select.Option value="prod">生产</Select.Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              showTime
              value={timeRange}
              onChange={(v) => setTimeRange(v)}
              style={{ width: 320 }}
            />
          </Col>
          <Col flex="auto">
            <Space style={{ float: 'right' }}>
              <Button icon={<ReloadOutlined />} onClick={loadMetrics}>
                刷新
              </Button>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={metrics}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
          }}
          locale={{ emptyText: <Empty description="暂无接口数据" /> }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <span>接口趋势分析</span>
            <Tag color="blue">{selectedMetric?.appCode}</Tag>
            <Tag color={methodColors[selectedMetric?.method || 'GET']}>{selectedMetric?.method}</Tag>
            <span>{selectedMetric?.path}</span>
          </Space>
        }
        open={!!selectedMetric}
        onCancel={() => {
          setSelectedMetric(null);
          setChartData([]);
        }}
        footer={null}
        width={1200}
      >
        {selectedMetric && chartData.length > 0 && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ReactECharts option={getChartOption('qps', 'QPS', '#1890ff', '/s')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('requestCount', '请求数', '#722ed1')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('errorRate', '错误率', '#eb2f96', '%')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('avgDuration', '平均响应时间', '#faad14', 'ms')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('p95Duration', 'P95 响应时间', '#13c2c2', 'ms')} style={{ height: 220 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('p99Duration', 'P99 响应时间', '#f5222d', 'ms')} style={{ height: 220 }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
