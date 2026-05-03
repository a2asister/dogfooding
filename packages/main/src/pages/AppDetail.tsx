import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Typography,
  Space,
  Divider,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Table,
  Popconfirm,
  Drawer,
  InputNumber,
  Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HistoryOutlined,
  BranchesOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import { microAppRegistry } from '@/services/microAppRegistry';
import {
  MicroApp,
  AppVersion,
  AppRoute,
  APP_STATUS_LABELS,
  APP_CATEGORIES,
  VERSION_STATUS_LABELS,
  VERSION_STATUS_COLORS,
  formatDate,
  formatDateShort,
  generateId,
  validateSemanticVersion,
  sortRoutesByOrder,
  sortVersionsByVersion,
  DEFAULT_SANDBOX_CONFIG,
} from '@/shared';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AppDetail: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [app, setApp] = useState<MicroApp | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [notFound, setNotFound] = useState(false);

  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [editingRoute, setEditingRoute] = useState<AppRoute | null>(null);
  const [changelogModalVisible, setChangelogModalVisible] = useState(false);
  const [selectedChangelog, setSelectedChangelog] = useState('');

  const [form] = Form.useForm();
  const [versionForm] = Form.useForm();
  const [routeForm] = Form.useForm();
  const [sandboxForm] = Form.useForm();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldOpenEdit = searchParams.get('edit') === 'true';

    if (!appId) {
      setNotFound(true);
      return;
    }

    console.log(`[AppDetail] Loading app with id: ${appId}`);
    console.log(`[AppDetail] All available apps:`, microAppRegistry.apps.map(a => ({ id: a.id, name: a.name, displayName: a.displayName })));

    const appData = microAppRegistry.getAppById(appId);
    
    if (!appData) {
      console.error(`[AppDetail] App not found with id: ${appId}`);
      setNotFound(true);
      return;
    }

    console.log(`[AppDetail] Found app:`, {
      id: appData.id,
      name: appData.name,
      displayName: appData.displayName,
      status: appData.status,
    });

    setApp(appData);
    setNotFound(false);

    form.setFieldsValue({
      displayName: appData.displayName,
      description: appData.description,
      category: appData.category,
      author: appData.author,
      status: appData.status,
    });
    sandboxForm.setFieldsValue({
      enabled: appData.sandboxConfig.enabled,
      strictStyleIsolation: appData.sandboxConfig.strictStyleIsolation,
      experimentalStyleIsolation: appData.sandboxConfig.experimentalStyleIsolation,
    });

    if (shouldOpenEdit) {
      setEditDrawerVisible(true);
    }
  }, [appId, location.search]);

  const handleEditSubmit = async (values: unknown) => {
    if (!app) return;
    setLoading(true);
    try {
      const updatedApp = {
        ...app,
        ...(values as Partial<MicroApp>),
      };
      microAppRegistry.updateApp(updatedApp);
      setApp(updatedApp);
      setEditDrawerVisible(false);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSubmit = async (values: {
    version: string;
    name: string;
    description: string;
    entry: string;
    status: AppVersion['status'];
    isDefault: boolean;
    changelog: string;
  }) => {
    if (!app) return;
    setLoading(true);
    try {
      if (editingVersion) {
        const updatedVersion: AppVersion = {
          ...editingVersion,
          ...values,
          updatedAt: new Date().toISOString(),
        };
        microAppRegistry.updateVersion(app.id, updatedVersion);
      } else {
        microAppRegistry.addVersion(app.id, {
          version: values.version,
          name: values.name,
          description: values.description,
          entry: values.entry,
          status: values.status,
          isDefault: values.isDefault,
          changelog: values.changelog,
          dependencies: {},
        });
      }
      const updatedApp = microAppRegistry.getAppById(app.id);
      if (updatedApp) {
        setApp(updatedApp);
      }
      setVersionModalVisible(false);
      setEditingVersion(null);
      versionForm.resetFields();
      message.success(editingVersion ? '版本更新成功' : '版本创建成功');
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSubmit = async (values: {
    path: string;
    name: string;
    title: string;
    icon: string;
    order: number;
    visibleInMenu: boolean;
  }) => {
    if (!app) return;
    setLoading(true);
    try {
      if (editingRoute) {
        const updatedRoute: AppRoute = {
          ...editingRoute,
          ...values,
          meta: {},
        };
        microAppRegistry.updateRoute(app.id, updatedRoute);
      } else {
        microAppRegistry.addRoute(app.id, {
          path: values.path,
          name: values.name,
          title: values.title,
          icon: values.icon,
          order: values.order,
          visibleInMenu: values.visibleInMenu,
          meta: {},
        });
      }
      const updatedApp = microAppRegistry.getAppById(app.id);
      if (updatedApp) {
        setApp(updatedApp);
      }
      setRouteModalVisible(false);
      setEditingRoute(null);
      routeForm.resetFields();
      message.success(editingRoute ? '路由更新成功' : '路由创建成功');
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxSubmit = async (values: {
    enabled: boolean;
    strictStyleIsolation: boolean;
    experimentalStyleIsolation: boolean;
  }) => {
    if (!app) return;
    setLoading(true);
    try {
      const updatedApp: MicroApp = {
        ...app,
        sandboxConfig: {
          ...app.sandboxConfig,
          ...values,
        },
      };
      microAppRegistry.updateApp(updatedApp);
      setApp(updatedApp);
      message.success('沙箱配置更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!app) return;
    microAppRegistry.removeVersion(app.id, versionId);
    const updatedApp = microAppRegistry.getAppById(app.id);
    if (updatedApp) {
      setApp(updatedApp);
    }
    message.success('版本已删除');
  };

  const handleDeleteRoute = (routeId: string) => {
    if (!app) return;
    microAppRegistry.removeRoute(app.id, routeId);
    const updatedApp = microAppRegistry.getAppById(app.id);
    if (updatedApp) {
      setApp(updatedApp);
    }
    message.success('路由已删除');
  };

  const openVersionModal = (version?: AppVersion) => {
    setEditingVersion(version || null);
    if (version) {
      versionForm.setFieldsValue({
        version: version.version,
        name: version.name,
        description: version.description,
        entry: version.entry,
        status: version.status,
        isDefault: version.isDefault,
        changelog: version.changelog,
      });
    } else {
      versionForm.resetFields();
      versionForm.setFieldsValue({
        status: 'draft',
        isDefault: false,
        order: 1,
      });
    }
    setVersionModalVisible(true);
  };

  const openRouteModal = (route?: AppRoute) => {
    setEditingRoute(route || null);
    if (route) {
      routeForm.setFieldsValue({
        path: route.path,
        name: route.name,
        title: route.title,
        icon: route.icon,
        order: route.order,
        visibleInMenu: route.visibleInMenu,
      });
    } else {
      routeForm.resetFields();
      routeForm.setFieldsValue({
        visibleInMenu: true,
        order: (app?.routes.length || 0) + 1,
        icon: 'FileOutlined',
      });
    }
    setRouteModalVisible(true);
  };

  const showChangelog = (changelog: string) => {
    setSelectedChangelog(changelog);
    setChangelogModalVisible(true);
  };

  const versionColumns: ColumnsType<AppVersion> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 140,
      render: (version: string, record) => (
        <Space>
          <Text strong className="version-tag">
            v{version}
          </Text>
          {record.isDefault && (
            <Tag color="blue" style={{ borderRadius: 4 }}>
              默认
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '版本名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '入口地址',
      dataIndex: 'entry',
      key: 'entry',
      width: 200,
      ellipsis: true,
      render: (entry: string) => (
        <Text code style={{ fontSize: 12 }}>
          {entry}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AppVersion['status']) => (
        <Tag color={VERSION_STATUS_COLORS[status]} style={{ borderRadius: 4 }}>
          {VERSION_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date: string) => formatDateShort(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => showChangelog(record.changelog)}
          >
            更新日志
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openVersionModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个版本吗？"
            onConfirm={() => handleDeleteVersion(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const routeColumns: ColumnsType<AppRoute> = [
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (path: string) => (
        <Text code style={{ fontSize: 13 }}>
          {path}
        </Text>
      ),
    },
    {
      title: '路由名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '显示标题',
      dataIndex: 'title',
      key: 'title',
      width: 120,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
    },
    {
      title: '菜单显示',
      dataIndex: 'visibleInMenu',
      key: 'visibleInMenu',
      width: 100,
      align: 'center',
      render: (visible: boolean) => (
        <Tag color={visible ? 'success' : 'default'} style={{ borderRadius: 4 }}>
          {visible ? '显示' : '隐藏'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openRouteModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个路由吗？"
            onConfirm={() => handleDeleteRoute(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'info',
      label: (
        <span>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          基本信息
        </span>
      ),
      children: app && (
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  color: '#fff',
                }}
              >
                {app.displayName.charAt(0)}
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                  {app.displayName}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  /{app.name}
                </Text>
                <Paragraph style={{ marginTop: 12, color: '#666', lineHeight: 1.8 }}>
                  {app.description}
                </Paragraph>
              </div>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditDrawerVisible(true)}
              style={{ borderRadius: 6 }}
            >
              编辑信息
            </Button>
          </div>

          <Divider />

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="应用标识">
              <Text code>{app.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="当前版本">
              <Text strong className="version-tag">
                v{app.currentVersion || '未设置'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="应用分类">
              <Tag color="blue" style={{ borderRadius: 4 }}>
                {APP_CATEGORIES.find((c) => c.value === app.category)?.label || app.category}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="应用状态">
              <Tag color="success" style={{ borderRadius: 4 }}>
                {APP_STATUS_LABELS[app.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="开发团队">{app.author}</Descriptions.Item>
            <Descriptions.Item label="版本数量">{app.versions.length} 个</Descriptions.Item>
            <Descriptions.Item label="路由数量">{app.routes.length} 个</Descriptions.Item>
            <Descriptions.Item label="沙箱状态">
              <Tag color={app.sandboxConfig.enabled ? 'success' : 'warning'} style={{ borderRadius: 4 }}>
                {app.sandboxConfig.enabled ? '已启用' : '未启用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {formatDate(app.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {formatDate(app.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'versions',
      label: (
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          版本管理
        </span>
      ),
      children: (
        <Card
          bordered={false}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openVersionModal()}
              style={{ borderRadius: 6 }}
            >
              新增版本
            </Button>
          }
        >
          <Table
            columns={versionColumns}
            dataSource={app ? sortVersionsByVersion(app.versions) : []}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个版本`,
              pageSizeOptions: ['5', '10', '20'],
              defaultPageSize: 10,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'routes',
      label: (
        <span>
          <BranchesOutlined style={{ marginRight: 8 }} />
          路由注册
        </span>
      ),
      children: (
        <Card
          bordered={false}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openRouteModal()}
              style={{ borderRadius: 6 }}
            >
              新增路由
            </Button>
          }
        >
          <Table
            columns={routeColumns}
            dataSource={app ? sortRoutesByOrder(app.routes) : []}
            rowKey="id"
            scroll={{ x: 800 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个路由`,
              pageSizeOptions: ['10', '20', '50'],
              defaultPageSize: 10,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'sandbox',
      label: (
        <span>
          <SafetyOutlined style={{ marginRight: 8 }} />
          隔离沙箱
        </span>
      ),
      children: (
        <Card bordered={false}>
          <Title level={5} style={{ marginBottom: 24, fontWeight: 600 }}>
            沙箱配置
          </Title>
          <Form
            form={sandboxForm}
            layout="vertical"
            onFinish={handleSandboxSubmit}
            initialValues={{
              enabled: DEFAULT_SANDBOX_CONFIG.enabled,
              strictStyleIsolation: DEFAULT_SANDBOX_CONFIG.strictStyleIsolation,
              experimentalStyleIsolation: DEFAULT_SANDBOX_CONFIG.experimentalStyleIsolation,
            }}
          >
            <Row gutter={[32, 0]}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <SafetyOutlined />
                      <span style={{ fontWeight: 600 }}>沙箱开关</span>
                    </Space>
                  }
                  bordered={false}
                  style={{ background: '#fafafa', marginBottom: 24, borderRadius: 8 }}
                >
                  <Form.Item
                    name="enabled"
                    label="启用沙箱隔离"
                    valuePropName="checked"
                    extra="启用后，子应用的JavaScript全局变量将被隔离"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Card>

                <Card
                  title={
                    <Space>
                      <SettingOutlined />
                      <span style={{ fontWeight: 600 }}>样式隔离</span>
                    </Space>
                  }
                  bordered={false}
                  style={{ background: '#fafafa', borderRadius: 8 }}
                >
                  <Form.Item
                    name="strictStyleIsolation"
                    label="严格样式隔离 (Shadow DOM)"
                    valuePropName="checked"
                    extra="使用Shadow DOM进行样式隔离，可能影响第三方组件库"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>

                  <Form.Item
                    name="experimentalStyleIsolation"
                    label="实验性样式隔离"
                    valuePropName="checked"
                    extra="通过CSS前缀方式隔离样式，兼容性更好"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <InfoCircleOutlined />
                      <span style={{ fontWeight: 600 }}>配置说明</span>
                    </Space>
                  }
                  bordered={false}
                  style={{ background: '#fafafa', borderRadius: 8, height: '100%' }}
                >
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 2 }}>
                    <Text strong style={{ color: '#333' }}>什么是沙箱？</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 16 }}>
                      沙箱是qiankun提供的一种机制，用于隔离不同微应用之间的全局变量冲突，确保各应用独立运行。
                    </Paragraph>

                    <Text strong style={{ color: '#333' }}>样式隔离方式：</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 16 }}>
                      <li>
                        <Text strong>严格样式隔离</Text>：使用Shadow DOM，完全隔离样式，但可能影响第三方库
                      </li>
                      <li>
                        <Text strong>实验性样式隔离</Text>：通过CSS前缀隔离，兼容性更好
                      </li>
                    </ul>

                    <Text strong style={{ color: '#333' }}>建议配置：</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      <li>生产环境：启用沙箱 + 实验性样式隔离</li>
                      <li>开发环境：可根据需要调整</li>
                      <li>第三方库较多时：建议使用实验性样式隔离</li>
                    </ul>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '24px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ borderRadius: 6, padding: '0 32px', height: 40 }}
              >
                保存配置
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
  ];

  if (notFound) {
    const handleResetData = () => {
      Modal.confirm({
        title: '确认重置数据',
        content: '这将重置所有应用数据为默认值，您确定要继续吗？',
        okText: '确认重置',
        cancelText: '取消',
        onOk: () => {
          microAppRegistry.resetToDefault();
          message.success('数据已重置，正在刷新页面...');
          setTimeout(() => {
            window.location.href = '/app-manage';
          }, 1000);
        },
      });
    };

    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} type="warning">
          应用不存在或数据格式错误
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 14 }}>
          应用ID: {appId}
          <br />
          可能原因：localStorage中的数据格式不正确，或应用已被删除
        </Paragraph>
        <Space size="middle" style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/app-manage')}>
            返回应用列表
          </Button>
          <Button onClick={handleResetData} danger>
            重置所有数据
          </Button>
        </Space>
        <div style={{ marginTop: 32, textAlign: 'left', background: '#f5f5f5', padding: 16, borderRadius: 8, maxWidth: 600, margin: '32px auto 0' }}>
          <Text strong>调试信息：</Text>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>当前应用ID: {appId || '(null)'}</li>
            <li>可用应用数量: {microAppRegistry.apps.length}</li>
            <li>
              可用应用ID: 
              {microAppRegistry.apps.length > 0 ? (
                <ul style={{ paddingLeft: 20 }}>
                  {microAppRegistry.apps.map(a => (
                    <li key={a.id}>{a.id} ({a.displayName})</li>
                  ))}
                </ul>
              ) : ' (无)'}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app-manage')}
          style={{ width: 36, height: 36 }}
        />
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            应用详情
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            管理应用的版本、路由和沙箱配置
          </Text>
        </div>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ padding: '0 24px' }}
        />
      </Card>

      <Drawer
        title="编辑应用信息"
        placement="right"
        width={520}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="displayName"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="请输入显示名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="应用描述"
            rules={[{ required: true, message: '请输入应用描述' }]}
          >
            <TextArea placeholder="请输入应用描述" rows={4} showCount maxLength={500} />
          </Form.Item>

          <Form.Item
            name="category"
            label="应用分类"
            rules={[{ required: true, message: '请选择应用分类' }]}
          >
            <Select placeholder="请选择分类">
              {APP_CATEGORIES.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="author"
            label="开发团队"
            rules={[{ required: true, message: '请输入开发团队' }]}
          >
            <Input placeholder="请输入开发团队" />
          </Form.Item>

          <Form.Item
            name="status"
            label="应用状态"
            rules={[{ required: true, message: '请选择应用状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(APP_STATUS_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setEditDrawerVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </div>
        </Form>
      </Drawer>

      <Modal
        title={editingVersion ? '编辑版本' : '新增版本'}
        open={versionModalVisible}
        onCancel={() => {
          setVersionModalVisible(false);
          setEditingVersion(null);
          versionForm.resetFields();
        }}
        width={600}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={versionForm}
          layout="vertical"
          onFinish={handleVersionSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[
                  { required: true, message: '请输入版本号' },
                  {
                    validator: (_, value) => {
                      if (!validateSemanticVersion(value)) {
                        return Promise.reject(new Error('请使用语义化版本号，如 1.0.0'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                help="语义化版本号：主版本号.次版本号.修订号"
              >
                <Input placeholder="例如: 1.0.0" prefix="v" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="版本名称"
                rules={[{ required: true, message: '请输入版本名称' }]}
                help="如：功能迭代、Bug修复、性能优化等"
              >
                <Input placeholder="例如: 功能迭代" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="版本描述"
            rules={[{ required: true, message: '请输入版本描述' }]}
          >
            <Input placeholder="简要描述此版本的主要内容" />
          </Form.Item>

          <Form.Item
            name="entry"
            label="入口地址"
            rules={[{ required: true, message: '请输入入口地址' }]}
            help="子应用的访问入口URL，如 //localhost:3001"
          >
            <Input placeholder="例如: //localhost:3001" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="版本状态"
                rules={[{ required: true, message: '请选择版本状态' }]}
              >
                <Select placeholder="请选择状态">
                  {Object.entries(VERSION_STATUS_LABELS).map(([key, label]) => (
                    <Option key={key} value={key}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="isDefault"
                label="设为默认版本"
                valuePropName="checked"
                extra="默认版本将被优先加载"
                style={{ marginTop: 28 }}
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="changelog"
            label="更新日志"
            rules={[{ required: true, message: '请输入更新日志' }]}
          >
            <TextArea
              placeholder="详细记录此版本的变更内容，每行一条"
              rows={6}
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              onClick={() => {
                setVersionModalVisible(false);
                setEditingVersion(null);
                versionForm.resetFields();
              }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingVersion ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingRoute ? '编辑路由' : '新增路由'}
        open={routeModalVisible}
        onCancel={() => {
          setRouteModalVisible(false);
          setEditingRoute(null);
          routeForm.resetFields();
        }}
        width={520}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={routeForm}
          layout="vertical"
          onFinish={handleRouteSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true, message: '请输入路由路径' }]}
            help="以斜杠开头，如 /dashboard/overview"
          >
            <Input placeholder="例如: /dashboard/overview" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="路由名称"
                rules={[{ required: true, message: '请输入路由名称' }]}
              >
                <Input placeholder="唯一标识符" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="显示标题"
                rules={[{ required: true, message: '请输入显示标题' }]}
              >
                <Input placeholder="菜单显示名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="icon"
                label="图标"
                rules={[{ required: true, message: '请输入图标名称' }]}
              >
                <Input placeholder="Ant Design图标名称" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="order"
                label="排序"
                rules={[{ required: true, message: '请输入排序号' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="数字越小越靠前" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="visibleInMenu"
            label="菜单显示"
            valuePropName="checked"
          >
            <Checkbox>在侧边栏菜单中显示此路由</Checkbox>
          </Form.Item>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              onClick={() => {
                setRouteModalVisible(false);
                setEditingRoute(null);
                routeForm.resetFields();
              }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRoute ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="更新日志"
        open={changelogModalVisible}
        onCancel={() => setChangelogModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setChangelogModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={520}
      >
        <div className="changelog-content">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {selectedChangelog || '暂无更新日志'}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default AppDetail;
