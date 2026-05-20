import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Modal, Form, Button, message } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { hostApi, Host, HostMetric } from '../api';

export default function HostMonitor() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [env, setEnv] = useState('');
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [metrics, setMetrics] = useState<HostMetric[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadHosts = async () => {
    setLoading(true);
    try {
      const data = await hostApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        env,
      });
      setHosts(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHosts();
  }, [pagination.current, pagination.pageSize, keyword, env]);

  const handleViewMetrics = async (host: Host) => {
    setSelectedHost(host);
    const data = await hostApi.getMetrics(host.id, {
      startTime: dayjs().subtract(1, 'hour').toISOString(),
    });
    setMetrics(data);
  };

  const handleSubmit = async (values: any) => {
    try {
      await hostApi.create(values);
      message.success('创建成功');
      setModalVisible(false);
      loadHosts();
    } catch (err) {
      // Error handled
    }
  };

  const columns = [
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '环境',
      dataIndex: 'env',
      key: 'env',
      render: (env: string) => <Tag color="blue">{env}</Tag>,
    },
    {
      title: 'CPU 核心',
      dataIndex: 'cpuCores',
      key: 'cpuCores',
    },
    {
      title: '总内存(GB)',
      dataIndex: 'memoryTotal',
      key: 'memoryTotal',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'success' : 'error'}>
          <span className={`status-dot status-${status}`} /> {status === 'online' ? '在线' : '离线'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Host) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewMetrics(record)}>
            查看指标
          </Button>
        </Space>
      ),
    },
  ];

  const getChartOption = (key: keyof HostMetric, title: string, color: string, unit = '%') => ({
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
              placeholder="搜索主机名/IP"
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
            <Space style={{ float: 'right' }}>
              <Button icon={<ReloadOutlined />} onClick={loadHosts}>
                刷新
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                添加主机
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={hosts}
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
        title="主机指标详情"
        open={!!selectedHost}
        onCancel={() => setSelectedHost(null)}
        footer={null}
        width={1200}
      >
        {selectedHost && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>{selectedHost.hostname}</strong> ({selectedHost.ip})
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ReactECharts option={getChartOption('cpuUsage', 'CPU 使用率', '#1890ff')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('memoryUsage', '内存使用率', '#52c41a')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('diskUsage', '磁盘使用率', '#faad14')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('loadAverage', '系统负载', '#722ed1', '')} style={{ height: 240 }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal title="添加主机" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="hostname" label="主机名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ip" label="IP 地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="env" label="环境" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="dev">开发环境</Select.Option>
              <Select.Option value="test">测试环境</Select.Option>
              <Select.Option value="pre">预发布环境</Select.Option>
              <Select.Option value="prod">生产环境</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
