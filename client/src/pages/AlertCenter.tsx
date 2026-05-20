import { useState, useEffect } from 'react';
import { Tabs, Table, Tag, Space, Input, Select, Card, Row, Col, Button, Modal, Form, message, Statistic, List, Badge, Switch, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined, BellOutlined, SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, MergeOutlined, MailOutlined, MessageOutlined, RobotOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { alertApi, alertChannelApi, alertConvergenceApi, AlertRule, AlertRecord, AlertChannel, AlertConvergence } from '../api';

const channelTypeIcons: Record<string, any> = {
  email: <MailOutlined />,
  dingtalk: <RobotOutlined />,
  wechat: <MessageOutlined />,
  webhook: <SettingOutlined />,
  sms: <PhoneOutlined />,
};

const channelTypeColors: Record<string, string> = {
  email: 'blue',
  dingtalk: 'cyan',
  wechat: 'green',
  webhook: 'purple',
  sms: 'orange',
};

const levelColors: Record<string, string> = {
  critical: 'red',
  warning: 'orange',
  info: 'blue',
  normal: 'default',
};

export default function AlertCenter() {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState<AlertRecord[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [channels, setChannels] = useState<AlertChannel[]>([]);
  const [convergences, setConvergences] = useState<AlertConvergence[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [channelType, setChannelType] = useState('');
  const [channelEnabled, setChannelEnabled] = useState('');
  const [convergenceStats, setConvergenceStats] = useState<any>({});
  const [overview, setOverview] = useState<any>({});

  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [editingChannel, setEditingChannel] = useState<AlertChannel | null>(null);
  const [channelForm] = Form.useForm();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [rulePagination, setRulePagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [channelPagination, setChannelPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [convergencePagination, setConvergencePagination] = useState({ current: 1, pageSize: 10, total: 0 });

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

  const loadChannels = async () => {
    setLoading(true);
    try {
      const data = await alertChannelApi.getList({
        page: channelPagination.current,
        pageSize: channelPagination.pageSize,
        type: channelType,
        enabled: channelEnabled,
      });
      setChannels(data.list);
      setChannelPagination((prev) => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  const loadConvergences = async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        alertConvergenceApi.getList({
          page: convergencePagination.current,
          pageSize: convergencePagination.pageSize,
        }),
        alertConvergenceApi.getStats(),
      ]);
      setConvergences(listData.list);
      setConvergencePagination((prev) => ({ ...prev, total: listData.total }));
      setConvergenceStats(statsData);
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
    } else if (activeTab === 'rules') {
      loadRules();
    } else if (activeTab === 'channels') {
      loadChannels();
    } else if (activeTab === 'convergence') {
      loadConvergences();
    }
  }, [activeTab, pagination.current, pagination.pageSize, rulePagination.current, rulePagination.pageSize, channelPagination.current, channelPagination.pageSize, convergencePagination.current, convergencePagination.pageSize, keyword, status, level, channelType, channelEnabled]);

  const handleSubmitChannel = async (values: any) => {
    try {
      if (editingChannel) {
        await alertChannelApi.update(editingChannel.id, values);
        message.success('更新成功');
      } else {
        await alertChannelApi.create(values);
        message.success('创建成功');
      }
      setChannelModalVisible(false);
      setEditingChannel(null);
      loadChannels();
    } catch (err) {
      // Error handled
    }
  };

  const handleEditChannel = (channel: AlertChannel) => {
    setEditingChannel(channel);
    channelForm.setFieldsValue(channel);
    setChannelModalVisible(true);
  };

  const handleDeleteChannel = async (id: number) => {
    try {
      await alertChannelApi.delete(id);
      message.success('删除成功');
      loadChannels();
    } catch (err) {
      // Error handled
    }
  };

  const handleTestChannel = async (id: number) => {
    try {
      await alertChannelApi.test(id);
      message.success('测试消息发送成功');
    } catch (err: any) {
      message.error(err.message || '测试失败');
    }
  };

  const handleToggleChannel = async (channel: AlertChannel, enabled: boolean) => {
    try {
      await alertChannelApi.update(channel.id, { ...channel, enabled });
      message.success(enabled ? '已启用' : '已禁用');
      loadChannels();
    } catch (err) {
      // Error handled
    }
  };

  const handleAcknowledgeConvergence = async (id: number) => {
    try {
      await alertConvergenceApi.acknowledge(id);
      message.success('已确认');
      loadConvergences();
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
      width: 150,
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

  const channelColumns = [
    {
      title: '渠道名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AlertChannel) => (
        <Space>
          <Tag color={channelTypeColors[record.type]}>{channelTypeIcons[record.type]}</Tag>
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const names: Record<string, string> = {
          email: '邮件',
          dingtalk: '钉钉',
          wechat: '企业微信',
          webhook: 'WebHook',
          sms: '短信',
        };
        return <Tag>{names[type] || type}</Tag>;
      },
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: string) => (
        <Tag color={levelColors[level]}>
          {level === 'critical' ? '严重' : level === 'warning' ? '警告' : level === 'info' ? '提示' : '普通'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: AlertChannel) => (
        <Switch
          checked={enabled}
          onChange={(v) => handleToggleChannel(record, v)}
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: AlertChannel) => (
        <Space>
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleTestChannel(record.id)}>
            测试
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditChannel(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteChannel(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const convergenceColumns = [
    {
      title: '告警规则',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: '分组字段',
      dataIndex: 'groupField',
      key: 'groupField',
      width: 120,
    },
    {
      title: '分组键',
      dataIndex: 'groupKey',
      key: 'groupKey',
      width: 200,
      ellipsis: true,
    },
    {
      title: '告警数量',
      dataIndex: 'alertCount',
      key: 'alertCount',
      width: 100,
      render: (count: number) => <Tag color="orange">{count}条</Tag>,
    },
    {
      title: '触发次数',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'isConverged',
      key: 'isConverged',
      width: 100,
      render: (converged: boolean) => (
        <Tag color={converged ? 'processing' : 'success'}>
          {converged ? '收敛中' : '已解除'}
        </Tag>
      ),
    },
    {
      title: '首次告警',
      dataIndex: 'firstAlertTime',
      key: 'firstAlertTime',
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '最近告警',
      dataIndex: 'lastAlertTime',
      key: 'lastAlertTime',
      width: 180,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: AlertConvergence) => (
        <Button
          type="link"
          size="small"
          disabled={!record.isConverged}
          onClick={() => handleAcknowledgeConvergence(record.id)}
        >
          确认解除
        </Button>
      ),
    },
  ];

  const renderChannelConfigFields = () => {
    const type = channelForm.getFieldValue('type');
    switch (type) {
      case 'email':
        return (
          <Form.Item name={['config', 'emails']} label="收件邮箱" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="输入邮箱地址，回车添加" />
          </Form.Item>
        );
      case 'dingtalk':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name={['config', 'webhook']} label="WebHook地址" rules={[{ required: true }]}>
              <Input placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" />
            </Form.Item>
            <Form.Item name={['config', 'secret']} label="签名密钥">
              <Input placeholder="SECxxx（可选，开启加签时需要）" />
            </Form.Item>
          </Space>
        );
      case 'wechat':
        return (
          <Form.Item name={['config', 'webhook']} label="WebHook地址" rules={[{ required: true }]}>
            <Input placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx" />
          </Form.Item>
        );
      case 'webhook':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name={['config', 'url']} label="回调地址" rules={[{ required: true }]}>
              <Input placeholder="https://api.example.com/alerts" />
            </Form.Item>
            <Form.Item name={['config', 'method']} label="请求方法" initialValue="POST">
              <Select>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        );
      case 'sms':
        return (
          <Form.Item name={['config', 'phones']} label="手机号码" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="输入手机号，回车添加" />
          </Form.Item>
        );
      default:
        return null;
    }
  };

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
    {
      key: 'channels',
      label: '通知渠道',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
              <Select
                placeholder="渠道类型"
                value={channelType || undefined}
                onChange={(v) => setChannelType(v)}
                style={{ width: 140 }}
                allowClear
              >
                <Select.Option value="email">邮件</Select.Option>
                <Select.Option value="dingtalk">钉钉</Select.Option>
                <Select.Option value="wechat">企业微信</Select.Option>
                <Select.Option value="webhook">WebHook</Select.Option>
                <Select.Option value="sms">短信</Select.Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="启用状态"
                value={channelEnabled || undefined}
                onChange={(v) => setChannelEnabled(v)}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="true">已启用</Select.Option>
                <Select.Option value="false">已禁用</Select.Option>
              </Select>
            </Col>
            <Col flex="auto">
              <Space style={{ float: 'right' }}>
                <Button icon={<ReloadOutlined />} onClick={loadChannels}>
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingChannel(null);
                    channelForm.resetFields();
                    setChannelModalVisible(true);
                  }}
                >
                  新增渠道
                </Button>
              </Space>
            </Col>
          </Row>
          <Table
            columns={channelColumns}
            dataSource={channels}
            rowKey="id"
            loading={loading}
            pagination={{
              ...channelPagination,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, pageSize) => setChannelPagination({ ...channelPagination, current: page, pageSize }),
            }}
          />
        </div>
      ),
    },
    {
      key: 'convergence',
      label: '告警收敛',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="收敛规则数"
                  value={convergenceStats.totalConvergences || 0}
                  prefix={<MergeOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="收敛中"
                  value={convergenceStats.activeConvergences || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="收敛告警数"
                  value={convergenceStats.totalAlertsConverged || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="降噪率"
                  value={convergenceStats.reductionRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
          <Table
            columns={convergenceColumns}
            dataSource={convergences}
            rowKey="id"
            loading={loading}
            pagination={{
              ...convergencePagination,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (page, pageSize) => setConvergencePagination({ ...convergencePagination, current: page, pageSize }),
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

      <Modal
        title={editingChannel ? '编辑通知渠道' : '新增通知渠道'}
        open={channelModalVisible}
        onCancel={() => {
          setChannelModalVisible(false);
          setEditingChannel(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={channelForm} layout="vertical" onFinish={handleSubmitChannel}>
          <Form.Item name="name" label="渠道名称" rules={[{ required: true }]}>
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="渠道类型" rules={[{ required: true }]}>
                <Select
                  onChange={() => {
                    setTimeout(() => channelForm.setFieldsValue({ config: {} }), 0);
                  }}
                >
                  <Select.Option value="email">邮件</Select.Option>
                  <Select.Option value="dingtalk">钉钉</Select.Option>
                  <Select.Option value="wechat">企业微信</Select.Option>
                  <Select.Option value="webhook">WebHook</Select.Option>
                  <Select.Option value="sms">短信</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="告警级别" rules={[{ required: true }]} initialValue="warning">
                <Select>
                  <Select.Option value="critical">严重</Select.Option>
                  <Select.Option value="warning">警告</Select.Option>
                  <Select.Option value="info">提示</Select.Option>
                  <Select.Option value="normal">普通</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {renderChannelConfigFields()}
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入渠道描述" />
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
              <Button onClick={() => setChannelModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
