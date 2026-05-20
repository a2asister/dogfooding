import { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Select, Card, Row, Col, Button, DatePicker, Modal, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { logApi, Log } from '../api';

const { RangePicker } = DatePicker;

export default function LogSearch() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [appCode, setAppCode] = useState('');
  const [env, setEnv] = useState('');
  const [level, setLevel] = useState('');
  const [timeRange, setTimeRange] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        appCode,
        env,
        level,
      };
      if (timeRange && timeRange.length === 2) {
        params.startTime = timeRange[0].toISOString();
        params.endTime = timeRange[1].toISOString();
      }
      const data = await logApi.getList(params);
      setLogs(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadLogs();
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
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: string) => <span className={`log-level log-level-${level}`}>{level}</span>,
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
    },
    {
      title: '日志内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Log) => (
        <Button type="link" size="small" onClick={() => setSelectedLog(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="搜索关键词"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 240 }}
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
              <Select.Option value="test-app">测试应用</Select.Option>
            </Select>
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
              placeholder="日志级别"
              value={level || undefined}
              onChange={(v) => setLevel(v)}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="INFO">INFO</Select.Option>
              <Select.Option value="WARN">WARN</Select.Option>
              <Select.Option value="ERROR">ERROR</Select.Option>
              <Select.Option value="DEBUG">DEBUG</Select.Option>
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
              <Button icon={<ReloadOutlined />} onClick={loadLogs}>
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
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
          }}
          locale={{ emptyText: <Empty description="暂无日志数据" /> }}
        />
      </Card>

      <Modal
        title="日志详情"
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={900}
      >
        {selectedLog && (
          <div style={{ fontFamily: 'Monaco, Menlo, monospace', fontSize: 13 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>时间：</strong>
                {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}
              </div>
              <div>
                <strong>级别：</strong>
                <span className={`log-level log-level-${selectedLog.level}`}>{selectedLog.level}</span>
              </div>
              <div>
                <strong>应用：</strong>
                {selectedLog.appCode}
              </div>
              <div>
                <strong>环境：</strong>
                {selectedLog.env}
              </div>
              <div>
                <strong>Logger：</strong>
                {selectedLog.logger}
              </div>
              <div>
                <strong>线程：</strong>
                {selectedLog.thread}
              </div>
              <div>
                <strong>TraceId：</strong>
                {selectedLog.traceId}
              </div>
              <div>
                <strong>位置：</strong>
                {selectedLog.className}:{selectedLog.lineNumber}
              </div>
              <div>
                <strong>消息：</strong>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8 }}>
                  {selectedLog.message}
                </pre>
              </div>
              {selectedLog.stackTrace && (
                <div>
                  <strong>堆栈：</strong>
                  <pre style={{ background: '#fff1f0', padding: 12, borderRadius: 4, marginTop: 8, color: '#ff4d4f' }}>
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
