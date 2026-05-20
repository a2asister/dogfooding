import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Button, DatePicker, Modal, Statistic, Empty, Progress, Timeline, Badge, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, LinkOutlined, BugOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { traceApi, Trace, Span } from '../api';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const serviceTypeColors: Record<string, string> = {
  frontend: 'purple',
  gateway: 'cyan',
  service: 'blue',
  database: 'orange',
  cache: 'green',
  mq: 'magenta',
};

const methodColors: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'cyan',
};

const statusColors: Record<number, 'success' | 'warning' | 'error' | 'default'> = {
  200: 'success',
  201: 'success',
  204: 'success',
  400: 'warning',
  401: 'warning',
  403: 'warning',
  404: 'warning',
  500: 'error',
  502: 'error',
  503: 'error',
};

export default function TraceList() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [traceId, setTraceId] = useState('');
  const [userId, setUserId] = useState('');
  const [appCode, setAppCode] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [path, setPath] = useState('');
  const [env, setEnv] = useState('');
  const [hasError, setHasError] = useState('');
  const [timeRange, setTimeRange] = useState<any>(null);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [spans, setSpans] = useState<Span[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [overview, setOverview] = useState<any>(null);
  const [topSlow, setTopSlow] = useState<Trace[]>([]);
  const [topErrors, setTopErrors] = useState<Trace[]>([]);

  const loadTraces = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        traceId,
        userId,
        appCode,
        serviceName,
        path,
        env,
        hasError,
      };
      if (timeRange && timeRange.length === 2) {
        params.startTime = timeRange[0].toISOString();
        params.endTime = timeRange[1].toISOString();
      }
      const data = await traceApi.getList(params);
      setTraces(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const [overviewData, slowData, errorData] = await Promise.all([
        traceApi.getOverview({ env }),
        traceApi.getTopSlow({ env, limit: 5 }),
        traceApi.getTopErrors({ env, limit: 5 }),
      ]);
      setOverview(overviewData);
      setTopSlow(slowData);
      setTopErrors(errorData);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [env]);

  useEffect(() => {
    loadTraces();
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadTraces();
    loadOverview();
  };

  const handleViewDetail = async (trace: Trace) => {
    setSelectedTrace(trace);
    const data = await traceApi.getDetail(trace.traceId);
    setSpans(data.spans);
  };

  const getDurationColor = (duration: number) => {
    if (duration > 3000) return 'red';
    if (duration > 1000) return 'orange';
    if (duration > 500) return 'gold';
    return 'green';
  };

  const buildSpanTree = (spans: Span[]) => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    spans.forEach((span) => {
      map.set(span.spanId, { ...span, children: [] });
    });

    spans.forEach((span) => {
      const node = map.get(span.spanId)!;
      if (span.parentSpanId && map.has(span.parentSpanId)) {
        map.get(span.parentSpanId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderSpanTimeline = (spans: Span[]) => {
    if (spans.length === 0) return <Empty description="暂无 Span 数据" />;

    const tree = buildSpanTree(spans);
    const minStartTime = Math.min(...spans.map((s) => s.startTime));
    const maxEndTime = Math.max(...spans.map((s) => s.endTime));
    const totalDuration = maxEndTime - minStartTime;

    const renderSpanNode = (span: any, level: number = 0) => {
      const left = ((span.startTime - minStartTime) / totalDuration) * 100;
      const width = (span.duration / totalDuration) * 100;
      const color = span.hasError ? '#ff4d4f' : getDurationColor(span.duration);

      return (
        <div key={span.spanId} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ width: level * 20, flexShrink: 0 }} />
            <Tag color={serviceTypeColors[span.serviceType] || 'default'} style={{ marginRight: 8 }}>
              {span.serviceName}
            </Tag>
            <span style={{ marginRight: 8, fontWeight: 500 }}>{span.name}</span>
            <Tag color={color}>{span.duration}ms</Tag>
            {span.hasError && <Tag color="error">异常</Tag>}
            {span.callType && <Tag color="cyan">{span.callType}</Tag>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: level * 20, flexShrink: 0 }} />
            <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 4, position: 'relative' }}>
              <Tooltip title={`${span.duration}ms (${width.toFixed(1)}%)`}>
                <div
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${Math.max(width, 2)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 4,
                    cursor: 'pointer',
                    opacity: 0.8,
                  }}
                />
              </Tooltip>
            </div>
          </div>
          {span.children && span.children.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {span.children.map((child: any) => renderSpanNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return <div>{tree.map((root) => renderSpanNode(root))}</div>;
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'TraceId',
      dataIndex: 'traceId',
      key: 'traceId',
      width: 200,
      ellipsis: true,
      render: (id: string) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</span>
        </Tooltip>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
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
      title: '入口服务',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 120,
      render: (name: string, record: Trace) => (
        <Tag color={serviceTypeColors[record.serviceType] || 'default'}>{name}</Tag>
      ),
    },
    {
      title: '请求',
      dataIndex: 'path',
      key: 'path',
      width: 250,
      ellipsis: true,
      render: (p: string, record: Trace) => (
        <Space>
          <Tag color={methodColors[record.method] || 'default'}>{record.method}</Tag>
          <span>{p}</span>
        </Space>
      ),
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 90,
      render: (code: number) => (
        <Badge status={statusColors[code] || 'default'} text={code} />
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (d: number) => (
        <Tag color={getDurationColor(d)}>
          <ClockCircleOutlined /> {d}ms
        </Tag>
      ),
    },
    {
      title: 'Span数',
      dataIndex: 'spanCount',
      key: 'spanCount',
      width: 80,
      render: (count: number, record: Trace) => (
        <Space>
          <span>{count}</span>
          {record.errorSpanCount > 0 && (
            <Tag color="red" style={{ fontSize: 12, padding: '0 6px' }}>
              {record.errorSpanCount}E
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'hasError',
      key: 'hasError',
      width: 80,
      render: (err: boolean) => (
        <Tag color={err ? 'error' : 'success'}>{err ? '异常' : '正常'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Trace) => (
        <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总请求数"
              value={overview?.totalTraces || 0}
              prefix={<FireOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误请求"
              value={overview?.errorTraces || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误率"
              value={overview?.errorRate || 0}
              suffix="%"
              valueStyle={{ color: overview?.errorRate > 5 ? '#ff4d4f' : '#52c41a' }}
              prefix={<Progress type="circle" percent={overview?.errorRate || 0} size={24} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均耗时"
              value={overview?.avgDuration || 0}
              suffix="ms"
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }} title="TOP 排行">
        <Row gutter={16}>
          <Col span={12}>
            <h4 style={{ marginBottom: 12 }}>TOP 5 慢调用</h4>
            {topSlow.length > 0 ? (
              <Timeline
                items={topSlow.map((t) => ({
                  color: getDurationColor(t.duration),
                  children: (
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Space>
                        <Tag color={methodColors[t.method]}>{t.method}</Tag>
                        <span style={{ fontSize: 12 }}>{t.path}</span>
                      </Space>
                      <Tag color={getDurationColor(t.duration)}>{t.duration}ms</Tag>
                    </Space>
                  ),
                }))}
              />
            ) : (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Col>
          <Col span={12}>
            <h4 style={{ marginBottom: 12 }}>TOP 5 异常调用</h4>
            {topErrors.length > 0 ? (
              <Timeline
                items={topErrors.map((t) => ({
                  color: 'red',
                  children: (
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Space>
                        <Tag color="red">{t.method}</Tag>
                        <span style={{ fontSize: 12 }}>{t.path}</span>
                      </Space>
                      <span style={{ fontSize: 12, color: '#ff4d4f' }}>{t.errorMessage}</span>
                    </Space>
                  ),
                }))}
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
            <Input
              placeholder="TraceId"
              prefix={<SearchOutlined />}
              value={traceId}
              onChange={(e) => setTraceId(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="用户ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ width: 140 }}
            />
          </Col>
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
              placeholder="服务名称"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              style={{ width: 140 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="接口路径"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              style={{ width: 180 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="选择环境"
              value={env || undefined}
              onChange={(v) => setEnv(v)}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="dev">开发</Select.Option>
              <Select.Option value="test">测试</Select.Option>
              <Select.Option value="pre">预发布</Select.Option>
              <Select.Option value="prod">生产</Select.Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="是否异常"
              value={hasError || undefined}
              onChange={(v) => setHasError(v)}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="true">异常</Select.Option>
              <Select.Option value="false">正常</Select.Option>
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
              <Button icon={<ReloadOutlined />} onClick={loadTraces}>
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
          dataSource={traces}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
          }}
          locale={{ emptyText: <Empty description="暂无链路数据" /> }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <span>链路详情</span>
            <Tag color="blue" style={{ fontFamily: 'monospace' }}>{selectedTrace?.traceId}</Tag>
          </Space>
        }
        open={!!selectedTrace}
        onCancel={() => {
          setSelectedTrace(null);
          setSpans([]);
        }}
        footer={null}
        width={1200}
      >
        {selectedTrace && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>TraceId</span>
                    <span style={{ fontFamily: 'monospace' }}>{selectedTrace.traceId}</span>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>用户ID</span>
                    <span>{selectedTrace.userId || '-'}</span>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>应用</span>
                    <Tag color="blue">{selectedTrace.appCode}</Tag>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>环境</span>
                    <Tag>{selectedTrace.env}</Tag>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>总耗时</span>
                    <Tag color={getDurationColor(selectedTrace.duration)}>{selectedTrace.duration}ms</Tag>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>状态码</span>
                    <Badge status={statusColors[selectedTrace.statusCode] || 'default'} text={selectedTrace.statusCode} />
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>Span数量</span>
                    <span>{selectedTrace.spanCount}</span>
                  </Space>
                </Col>
                <Col span={6}>
                  <Space direction="vertical" size={0}>
                    <span style={{ color: '#888', fontSize: 12 }}>时间</span>
                    <span>{dayjs(selectedTrace.timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </Space>
                </Col>
              </Row>
              {selectedTrace.errorMessage && (
                <div style={{ marginTop: 12, padding: 12, background: '#fff1f0', borderRadius: 4 }}>
                  <strong style={{ color: '#ff4d4f' }}>错误信息：</strong>
                  {selectedTrace.errorMessage}
                </div>
              )}
            </Card>

            <Card size="small" title="调用时序">
              {renderSpanTimeline(spans)}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
