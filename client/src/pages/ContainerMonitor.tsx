import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Modal, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { containerApi, Container, ContainerMetric } from '../api';

export default function ContainerMonitor() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [env, setEnv] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [metrics, setMetrics] = useState<ContainerMetric[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadContainers = async () => {
    setLoading(true);
    try {
      const data = await containerApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        env,
      });
      setContainers(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, [pagination.current, pagination.pageSize, keyword, env]);

  const handleViewMetrics = async (container: Container) => {
    setSelectedContainer(container);
    const data = await containerApi.getMetrics(container.containerId, {
      startTime: dayjs().subtract(1, 'hour').toISOString(),
    });
    setMetrics(data);
  };

  const columns = [
    {
      title: '容器名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '容器 ID',
      dataIndex: 'containerId',
      key: 'containerId',
    },
    {
      title: '镜像',
      dataIndex: 'image',
      key: 'image',
    },
    {
      title: '环境',
      dataIndex: 'env',
      key: 'env',
      render: (env: string) => <Tag color="blue">{env}</Tag>,
    },
    {
      title: '所属主机',
      dataIndex: 'hostId',
      key: 'hostId',
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
      render: (_: any, record: Container) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewMetrics(record)}>
            查看指标
          </Button>
        </Space>
      ),
    },
  ];

  const getChartOption = (key: keyof ContainerMetric, title: string, color: string, unit = '%') => ({
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
              placeholder="搜索容器名称/ID"
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
            <Button icon={<ReloadOutlined />} onClick={loadContainers} style={{ float: 'right' }}>
              刷新
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={containers}
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
        title="容器指标详情"
        open={!!selectedContainer}
        onCancel={() => setSelectedContainer(null)}
        footer={null}
        width={1200}
      >
        {selectedContainer && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>{selectedContainer.name}</strong> ({selectedContainer.containerId})
              <Tag style={{ marginLeft: 8 }}>{selectedContainer.image}</Tag>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ReactECharts option={getChartOption('cpuUsage', 'CPU 使用率', '#1890ff')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('memoryUsage', '内存使用率', '#52c41a')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('networkIn', '网络流入', '#13c2c2', ' KB/s')} style={{ height: 240 }} />
              </Col>
              <Col span={12}>
                <ReactECharts option={getChartOption('networkOut', '网络流出', '#eb2f96', ' KB/s')} style={{ height: 240 }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
