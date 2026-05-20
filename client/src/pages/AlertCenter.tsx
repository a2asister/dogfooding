import { useState, useEffect } from 'react';
import { Tabs, Table, Tag, Space, Input, Select, Card, Row, Col, Button, Modal, Form, message, Statistic } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { alertApi, AlertRule, AlertRecord } from '../api';

export default function AlertCenter() {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState<AlertRecord[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AlertRecord | null>(null);
  const [form] = Form.useForm();
  const [handleForm] = Form.useForm();
  const [overview, setOverview] = useState<any>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [rulePagination, setRulePagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await alertApi.getRecords({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        status,
        level,
      });
      setRecords(data.list);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await alertApi.getRules({
        page: rulePagination.current,
        pageSize: rulePagination.pageSize,
        keyword,
      });
      setRules(data.list);
      setRulePagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    const data = await alertApi.getOverview();
    setOverview(data);
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords();
    } else {
      loadRules();
    }
  }, [activeTab, pagination.current, pagination.pageSize, rulePagination.current, rulePagination.pageSize, keyword, status, level]);

  const handleSubmitRule = async (values: any) => {
    try {
      await alertApi.createRule(values);
      message.success('创建成功');
      setModalVisible(false);
      loadRules();
    } catch (err) {
      // Error handled
    }
  };

  const handleHandleRecord = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await alertApi.handleRecord(selectedRecord.id, values);
      message.success('处理成功');
      setHandleModalVisible(false);
      loadRecords();
      loadOverview();
    } catch (err) {
      // Error handled
    }
  };

  const recordColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '告警名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={level === 'critical' ? 'red' : level === 'warning' ? 'orange' : 'blue'}>
          {level === 'critical' ? '严重' : level === 'warning' ? '警告' : '提示'}
        </Tag>
      ),
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 100,
      render: (v: number, record: AlertRecord) => `${v} ${record.operator} ${record.threshold}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'red',
          processing: 'orange',
          resolved: 'green',
        };
        const textMap: Record<string, string> = {
          pending: '待处理',
          processing: '处理中',
          resolved: '已解决',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '处理人',
      dataIndex: 'handledBy',
      key: 'handledBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: AlertRecord) => (
        <Space>
          <Button
            type="link"
            size="small"
            disabled={record.status === 'resolved'}
            onClick={() => {
              setSelectedRecord(record);
              handleForm.resetFields();
              setHandleModalVisible(true);
            }}
          >
            处理
          </Button>
        </Space>
      ),
    },
  ];

  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '条件',
      key: 'condition',
      render: (_: any, record: AlertRule) => `${record.metric} ${record.operator} ${record.threshold}`,
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (d: number) => `${d}秒`,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === 'critical' ? 'red' : level === 'warning' ? 'orange' : 'blue'}>
          {level === 'critical' ? '严重' : level === 'warning' ? '警告' : '提示'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>,
    },
  ];

  const tabItems = [
    {
      key: 'records',
      label: '告警记录',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
              <Input
                placeholder="搜索告警名称"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 200 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="选择状态"
                value={status || undefined}
                onChange={(v) => setStatus(v)}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="processing">处理中</Select.Option>
                <Select.Option value="resolved">已解决</Select.Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="选择级别"
                value={level || undefined}
                onChange={(v) => setLevel(v)}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="critical">严重</Select.Option>
                <Select.Option value="warning">警告</Select.Option>
                <Select.Option value="info">提示</Select.Option>
              </Select>
            </Col>
            <Col flex="auto">
              <Button icon={<ReloadOutlined />} onClick={loadRecords} style={{ float: 'right' }}>
                刷新
              </Button>
            </Col>
          </Row>
          <Table
            columns={recordColumns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
            }}
          />
        </div>
      ),
    },
    {
      key: 'rules',
      label: '告警规则',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Button type="primary" onClick={() => setModalVisible(true)} style={{ float: 'right' }}>
                新建规则
              </Button>
            </Col>
          </Row>
          <Table
            columns={ruleColumns}
            dataSource={rules}
            rowKey="id"
            loading={loading}
            pagination={{
              ...rulePagination,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, pageSize) => setRulePagination({ ...rulePagination, current: page, pageSize }),
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="待处理告警"
              value={overview.pending || 0}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="处理中"
              value={overview.processing || 0}
              prefix={<BellOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="严重告警"
              value={overview.critical || 0}
              prefix={<WarningOutlined style={{ color: '#cf1322' }} />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="警告告警"
              value={overview.warning || 0}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal title="新建告警规则" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmitRule}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="metric" label="指标" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="cpu_usage">CPU使用率</Select.Option>
                  <Select.Option value="memory_usage">内存使用率</Select.Option>
                  <Select.Option value="disk_usage">磁盘使用率</Select.Option>
                  <Select.Option value="load_average">系统负载</Select.Option>
                  <Select.Option value="error_rate">错误率</Select.Option>
                  <Select.Option value="avg_response_time">平均响应时间</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operator" label="操作符" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value={'>'}>{'大于 (>)'}</Select.Option>
                  <Select.Option value={'>='}>{'大于等于 (>=)'}</Select.Option>
                  <Select.Option value={'<'}>{'小于 (<)'}</Select.Option>
                  <Select.Option value={'<='}>{'小于等于 (<=)'}</Select.Option>
                  <Select.Option value="==">{'等于 (==)'}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="threshold" label="阈值" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="持续时间(秒)" rules={[{ required: true }]} initialValue={60}>
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="level" label="告警级别" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="info">提示</Select.Option>
              <Select.Option value="warning">警告</Select.Option>
              <Select.Option value="critical">严重</Select.Option>
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

      <Modal
        title="处理告警"
        open={handleModalVisible}
        onCancel={() => setHandleModalVisible(false)}
        footer={null}
      >
        <Form form={handleForm} layout="vertical" onFinish={handleHandleRecord}>
          <Form.Item name="status" label="处理状态" rules={[{ required: true }]} initialValue="processing">
            <Select>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="resolved">已解决</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="handleNote" label="处理备注">
            <Input.TextArea rows={4} placeholder="请输入处理说明..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
              <Button onClick={() => setHandleModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
