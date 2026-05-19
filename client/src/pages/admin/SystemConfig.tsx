import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card, Tag } from 'antd';
import { adminApi } from '../../services/api';

interface SystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  description: string;
  updatedAt: string;
}

const defaultConfigs: SystemConfig[] = [
  { id: 1, configKey: 'deposit_rate', configValue: '0.1', description: '保证金比例（成交价百分比）', updatedAt: '2024-01-01' },
  { id: 2, configKey: 'commission_rate', configValue: '0.05', description: '平台佣金比例', updatedAt: '2024-01-01' },
  { id: 3, configKey: 'penalty_rate', configValue: '0.5', description: '违约扣款比例（保证金百分比）', updatedAt: '2024-01-01' },
  { id: 4, configKey: 'payment_timeout', configValue: '1800', description: '订单支付超时时间（秒）', updatedAt: '2024-01-01' },
  { id: 5, configKey: 'bid_extend_time', configValue: '60', description: '尾盘出价延长时间（秒）', updatedAt: '2024-01-01' },
  { id: 6, configKey: 'min_increment', configValue: '10', description: '最小加价幅度（元）', updatedAt: '2024-01-01' },
  { id: 7, configKey: 'max_auction_duration', configValue: '86400', description: '拍卖最大时长（秒）', updatedAt: '2024-01-01' },
  { id: 8, configKey: 'withdraw_threshold', configValue: '100', description: '最低提现金额（元）', updatedAt: '2024-01-01' },
  { id: 9, configKey: 'sms_enabled', configValue: 'true', description: '是否启用短信通知', updatedAt: '2024-01-01' },
  { id: 10, configKey: 'auto_confirm_days', configValue: '7', description: '自动确认收货天数', updatedAt: '2024-01-01' }
];

function SystemConfig(): JSX.Element {
  const [configs, setConfigs] = useState<SystemConfig[]>(defaultConfigs);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SystemConfig | null>(null);
  const [form] = Form.useForm();

  const loadConfigs = async (): Promise<void> => {
    try {
      const res = await adminApi.getConfigs() as unknown as { configs: SystemConfig[] };
      if (res.configs && res.configs.length > 0) {
        setConfigs(res.configs);
      }
    } catch {
      // Use default configs if API fails
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleEdit = (config: SystemConfig): void => {
    setCurrentConfig(config);
    form.setFieldsValue({
      configValue: config.configValue,
      description: config.description
    });
    setEditModalVisible(true);
  };

  const handleSubmitEdit = async (values: { configValue: string; description: string }): Promise<void> => {
    if (!currentConfig) return;

    try {
      await adminApi.updateConfig({
        key: currentConfig.configKey,
        value: values.configValue,
        description: values.description
      });
      message.success('配置更新成功');
      setEditModalVisible(false);
      form.resetFields();
      loadConfigs();
    } catch {
      message.error('配置更新失败');
    }
  };

  const formatValue = (config: SystemConfig): { value: string; tag?: string } => {
    if (config.configKey.includes('rate')) {
      return {
        value: `${(parseFloat(config.configValue) * 100).toFixed(1)}%`,
        tag: '比例'
      };
    }
    if (config.configKey.includes('timeout') || config.configKey.includes('duration') || config.configKey.includes('time')) {
      const seconds = parseInt(config.configValue);
      if (seconds >= 86400) {
        return { value: `${(seconds / 86400).toFixed(0)}天`, tag: '时间' };
      }
      if (seconds >= 3600) {
        return { value: `${(seconds / 3600).toFixed(0)}小时`, tag: '时间' };
      }
      if (seconds >= 60) {
        return { value: `${(seconds / 60).toFixed(0)}分钟`, tag: '时间' };
      }
      return { value: `${seconds}秒`, tag: '时间' };
    }
    if (config.configKey === 'sms_enabled') {
      return {
        value: config.configValue === 'true' ? '已启用' : '已禁用',
        tag: config.configValue === 'true' ? 'success' : 'error'
      };
    }
    if (config.configKey.includes('days')) {
      return { value: `${config.configValue}天`, tag: '时间' };
    }
    if (config.configKey.includes('threshold') || config.configKey.includes('increment')) {
      return { value: `¥${config.configValue}`, tag: '金额' };
    }
    return { value: config.configValue };
  };

  const columns = [
    {
      title: '配置项',
      dataIndex: 'configKey',
      key: 'configKey',
      width: 200,
      render: (val: string) => <code>{val}</code>
    },
    {
      title: '配置值',
      key: 'value',
      render: (_: unknown, record: SystemConfig) => {
        const formatted = formatValue(record);
        return (
          <Space>
            <span style={{ fontWeight: 500 }}>{formatted.value}</span>
            {formatted.tag && (
              <Tag color={formatted.tag === 'success' ? 'green' : formatted.tag === 'error' ? 'red' : 'blue'}>
                {formatted.tag === 'success' ? '启用' : formatted.tag === 'error' ? '禁用' : formatted.tag}
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '原始值',
      dataIndex: 'configValue',
      key: 'configValue',
      width: 120,
      render: (val: string) => <code>{val}</code>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '最后更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: SystemConfig) => (
        <Button type="link" size="small" onClick={() => handleEdit(record)}>
          编辑
        </Button>
      )
    }
  ];

  return (
    <div>
      <h2 className="page-title">系统参数配置</h2>
      
      <Card style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#666' }}>
          <strong>提示：</strong>修改系统参数后将立即生效，请谨慎操作。涉及资金的参数修改建议在业务低峰期进行。
        </p>
      </Card>

      <Table
        dataSource={configs}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={`编辑配置 - ${currentConfig?.configKey}`}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitEdit}>
          <Form.Item
            name="configValue"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input placeholder="请输入配置值" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SystemConfig;
