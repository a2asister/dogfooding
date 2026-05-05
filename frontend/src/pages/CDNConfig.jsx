import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Select,
  Switch,
  Input,
  message,
  Spin,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Statistic,
  Descriptions,
  Empty,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  CloudOutlined,
  SettingOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  FileOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { cdnApi } from '../services/api';

const { Option } = Select;
const { Password } = Input;

function CDNConfig() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [config, setConfig] = useState({
    enabled: false,
    provider: 'local',
    config: {}
  });
  const [providers, setProviders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentSite) {
      loadConfig();
      loadProviders();
      loadAssets();
    }
  }, [currentSite]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await cdnApi.getConfig(currentSite.id);
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('加载 CDN 配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await cdnApi.getProviders(currentSite.id);
      if (response.success) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('加载 CDN 提供商列表失败:', error);
    }
  };

  const loadAssets = async () => {
    setAssetsLoading(true);
    try {
      const response = await cdnApi.getAssets(currentSite.id, { limit: 50 });
      if (response.success) {
        setAssets(response.data.items || []);
      }
    } catch (error) {
      console.error('加载 CDN 资源列表失败:', error);
    } finally {
      setAssetsLoading(false);
    }
  };

  const openConfigModal = () => {
    form.setFieldsValue({
      enabled: config.enabled,
      provider: config.provider || 'local',
      ...config.config
    });
    setConfigModalVisible(true);
  };

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      const { enabled, provider, ...providerConfig } = values;
      
      const response = await cdnApi.updateConfig(currentSite.id, {
        enabled,
        provider,
        config: providerConfig
      });
      
      if (response.success) {
        message.success('CDN 配置已保存');
        setConfig(response.data);
        setConfigModalVisible(false);
      }
    } catch (error) {
      message.error(error.response?.data?.error || '保存失败');
    }
  };

  const handleSyncAssets = async () => {
    setSyncing(true);
    try {
      const response = await cdnApi.syncAssets(currentSite.id);
      if (response.success) {
        message.success(response.data.message || '同步任务已启动');
        setTimeout(loadAssets, 2000);
      }
    } catch (error) {
      message.error(error.response?.data?.error || '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'local':
        return <FileOutlined style={{ color: '#1890ff' }} />;
      case 'aliyun':
        return <CloudOutlined style={{ color: '#ff6a00' }} />;
      case 'qiniu':
        return <CloudOutlined style={{ color: '#0099ff' }} />;
      case 'aws':
        return <CloudOutlined style={{ color: '#ff9900' }} />;
      default:
        return <CloudOutlined />;
    }
  };

  const getStatusTag = (status) => {
    const colors = {
      synced: 'success',
      syncing: 'processing',
      pending: 'default',
      failed: 'error'
    };
    const labels = {
      synced: '已同步',
      syncing: '同步中',
      pending: '待同步',
      failed: '同步失败'
    };
    return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
  };

  const renderProviderConfig = () => {
    const selectedProvider = form.getFieldValue('provider');
    
    switch (selectedProvider) {
      case 'aliyun':
        return (
          <>
            <Form.Item
              name="accessKeyId"
              label="AccessKey ID"
              rules={[{ required: true, message: '请输入 AccessKey ID' }]}
            >
              <Input size="large" placeholder="LTAI5t..." />
            </Form.Item>
            <Form.Item
              name="accessKeySecret"
              label="AccessKey Secret"
              rules={[{ required: true, message: '请输入 AccessKey Secret' }]}
            >
              <Password size="large" placeholder="请输入 Secret" />
            </Form.Item>
            <Form.Item
              name="bucket"
              label="Bucket 名称"
              rules={[{ required: true, message: '请输入 Bucket 名称' }]}
            >
              <Input size="large" placeholder="my-cdn-bucket" />
            </Form.Item>
            <Form.Item
              name="region"
              label="地域 (Region)"
              rules={[{ required: true, message: '请输入地域' }]}
            >
              <Input size="large" placeholder="oss-cn-hangzhou" />
            </Form.Item>
            <Form.Item
              name="endpoint"
              label="自定义域名 (Endpoint)"
              help="可选，用于自定义 CDN 域名"
            >
              <Input size="large" placeholder="https://cdn.example.com" />
            </Form.Item>
          </>
        );
      case 'qiniu':
        return (
          <>
            <Form.Item
              name="accessKey"
              label="AccessKey"
              rules={[{ required: true, message: '请输入 AccessKey' }]}
            >
              <Input size="large" placeholder="请输入 AccessKey" />
            </Form.Item>
            <Form.Item
              name="secretKey"
              label="SecretKey"
              rules={[{ required: true, message: '请输入 SecretKey' }]}
            >
              <Password size="large" placeholder="请输入 SecretKey" />
            </Form.Item>
            <Form.Item
              name="bucket"
              label="Bucket 名称"
              rules={[{ required: true, message: '请输入 Bucket 名称' }]}
            >
              <Input size="large" placeholder="my-cdn-bucket" />
            </Form.Item>
            <Form.Item
              name="domain"
              label="CDN 域名"
              rules={[{ required: true, message: '请输入 CDN 域名' }]}
            >
              <Input size="large" placeholder="https://cdn.example.com" />
            </Form.Item>
          </>
        );
      case 'aws':
        return (
          <>
            <Form.Item
              name="accessKeyId"
              label="Access Key ID"
              rules={[{ required: true, message: '请输入 Access Key ID' }]}
            >
              <Input size="large" placeholder="AKIAIOSFODNN7EXAMPLE" />
            </Form.Item>
            <Form.Item
              name="secretAccessKey"
              label="Secret Access Key"
              rules={[{ required: true, message: '请输入 Secret Access Key' }]}
            >
              <Password size="large" placeholder="请输入 Secret Key" />
            </Form.Item>
            <Form.Item
              name="bucket"
              label="Bucket 名称"
              rules={[{ required: true, message: '请输入 Bucket 名称' }]}
            >
              <Input size="large" placeholder="my-cdn-bucket" />
            </Form.Item>
            <Form.Item
              name="region"
              label="区域 (Region)"
              rules={[{ required: true, message: '请输入区域' }]}
            >
              <Input size="large" placeholder="us-east-1" />
            </Form.Item>
          </>
        );
      default:
        return (
          <Alert
            message="本地存储模式"
            description="使用服务器本地文件系统存储静态资源，无需额外配置。发布时内容将生成到本地 public 目录。"
            type="info"
            showIcon
          />
        );
    }
  };

  const assetColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <FileOutlined style={{ color: '#667eea' }} />
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color="blue">{type || '文件'}</Tag>
      )
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size) => {
        if (!size) return '-';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '同步时间',
      dataIndex: 'syncedAt',
      key: 'syncedAt',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    }
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>CDN 配置</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              配置内容分发网络，加速静态资源访问
            </p>
          </div>
          <Space>
            <Button
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSyncAssets}
              loading={syncing}
              disabled={!config.enabled}
            >
              同步资源
            </Button>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={openConfigModal}
            >
              配置 CDN
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card 
              className="stats-card" 
              bordered={false}
              style={{ 
                background: config.enabled 
                  ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
                  : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)' 
              }}
            >
              <Statistic
                title={<span style={{ color: config.enabled ? '#fff' : '#6b7280' }}>CDN 状态</span>}
                value={config.enabled ? '已启用' : '未启用'}
                prefix={<CloudOutlined style={{ color: config.enabled ? '#fff' : '#6b7280' }} />}
                valueStyle={{ color: config.enabled ? '#fff' : '#6b7280', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card className="stats-card" bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Statistic
                title={<span style={{ color: '#fff' }}>CDN 提供商</span>}
                value={getProviderName(config.provider)}
                prefix={getProviderIcon(config.provider)}
                valueStyle={{ color: '#fff', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card className="stats-card" bordered={false} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Statistic
                title={<span style={{ color: '#fff' }}>已同步资源</span>}
                value={assets.filter(a => a.status === 'synced').length}
                prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="当前配置" className="form-card" style={{ marginBottom: 24 }}>
          {config.enabled ? (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="CDN 状态">
                <Tag color="success">已启用</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CDN 提供商">
                <Space>
                  {getProviderIcon(config.provider)}
                  {getProviderName(config.provider)}
                </Space>
              </Descriptions.Item>
              {config.provider !== 'local' && config.config?.bucket && (
                <Descriptions.Item label="Bucket">
                  {config.config.bucket}
                </Descriptions.Item>
              )}
              {config.provider !== 'local' && config.config?.region && (
                <Descriptions.Item label="区域">
                  {config.config.region}
                </Descriptions.Item>
              )}
              {config.provider !== 'local' && (config.config?.endpoint || config.config?.domain) && (
                <Descriptions.Item label="CDN 域名" span={2}>
                  <a href={config.config.endpoint || config.config.domain} target="_blank" rel="noopener noreferrer">
                    {config.config.endpoint || config.config.domain}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Alert
              message="CDN 未启用"
              description={
                <div>
                  <p>当前使用本地文件系统存储静态资源。</p>
                  <p style={{ marginTop: 8 }}>
                    <Button type="primary" icon={<SettingOutlined />} onClick={openConfigModal}>
                      配置 CDN
                    </Button>
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
          )}
        </Card>

        <Card title="CDN 资源列表" className="form-card">
          <Spin spinning={assetsLoading}>
            {assets.length > 0 ? (
              <Table
                columns={assetColumns}
                dataSource={assets}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 个资源`
                }}
                className="table-container"
              />
            ) : (
              <Empty
                description={
                  <div>
                    <p style={{ marginBottom: 16 }}>暂无同步的 CDN 资源</p>
                    <Space>
                      {config.enabled ? (
                        <Button 
                          type="primary" 
                          icon={<SyncOutlined spin={syncing} />} 
                          onClick={handleSyncAssets}
                          loading={syncing}
                        >
                          同步资源
                        </Button>
                      ) : (
                        <Button type="primary" icon={<SettingOutlined />} onClick={openConfigModal}>
                          先配置 CDN
                        </Button>
                      )}
                    </Space>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 60 }}
              />
            )}
          </Spin>
        </Card>

        <Card title="可用 CDN 提供商" className="form-card" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            {providers.map(provider => (
              <Col xs={24} sm={12} md={6} key={provider.id}>
                <Card 
                  hoverable 
                  className="form-card"
                  style={{ 
                    borderColor: config.provider === provider.id ? '#667eea' : '#f0f0f0',
                    background: config.provider === provider.id ? '#f0f5ff' : '#fff'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {config.provider === provider.id && (
                      <Tag color="blue" style={{ marginBottom: 12 }}>当前使用</Tag>
                    )}
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                      {provider.name}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                      {provider.description}
                    </p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Modal
          title="CDN 配置"
          open={configModalVisible}
          onOk={handleSaveConfig}
          onCancel={() => setConfigModalVisible(false)}
          okText="保存"
          cancelText="取消"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="enabled"
              label="启用 CDN"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            </Form.Item>

            <Form.Item
              name="provider"
              label="CDN 提供商"
              rules={[{ required: true, message: '请选择 CDN 提供商' }]}
            >
              <Select size="large" placeholder="选择 CDN 提供商">
                {providers.map(provider => (
                  <Option key={provider.id} value={provider.id}>
                    <Space>
                      {getProviderIcon(provider.id)}
                      {provider.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider />

            {renderProviderConfig()}
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}

export default CDNConfig;
