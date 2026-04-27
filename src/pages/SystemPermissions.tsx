import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Switch,
  Modal,
  Form,
  Popconfirm,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Drawer,
  Descriptions,
  Divider,
  Tabs,
  Checkbox,
  List,
  Avatar,
  Badge,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  toggleUserActive,
  updateUserRole,
  updateUserPermissions,
  fetchOperationLogs,
} from '@/store/slices/systemSlice';
import StatCard from '@/components/StatCard';
import type { User, OperationLog } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { CheckboxGroup } = Checkbox;

const ROLE_CONFIG = {
  admin: {
    label: '系统管理员',
    color: 'error',
    permissions: ['all'],
  },
  dispatcher: {
    label: '调度员',
    color: 'blue',
    permissions: ['orders:read', 'orders:dispatch', 'vehicles:read', 'drivers:read'],
  },
  operator: {
    label: '运维人员',
    color: 'green',
    permissions: ['config:read', 'alerts:read', 'reports:read'],
  },
};

const ALL_PERMISSIONS = [
  { label: '订单读取', value: 'orders:read' },
  { label: '订单派单', value: 'orders:dispatch' },
  { label: '车辆读取', value: 'vehicles:read' },
  { label: '车辆管理', value: 'vehicles:manage' },
  { label: '司机读取', value: 'drivers:read' },
  { label: '司机管理', value: 'drivers:manage' },
  { label: '配置读取', value: 'config:read' },
  { label: '配置管理', value: 'config:manage' },
  { label: '告警读取', value: 'alerts:read' },
  { label: '告警管理', value: 'alerts:manage' },
  { label: '报表读取', value: 'reports:read' },
  { label: '报表导出', value: 'reports:export' },
  { label: '用户管理', value: 'users:manage' },
  { label: '日志查看', value: 'logs:read' },
];

const SystemPermissions = () => {
  const dispatch = useAppDispatch();
  const { users, operationLogs, currentUser, loading } = useAppSelector((state) => state.system);

  const [activeTab, setActiveTab] = useState<string>('users');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
    dispatchers: users.filter((u) => u.role === 'dispatcher').length,
    operators: users.filter((u) => u.role === 'operator').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (selectedRole && user.role !== selectedRole) return false;
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.phone.includes(searchText)
        );
      }
      return true;
    });
  }, [users, searchText, selectedRole]);

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsUserModalOpen(true);
  };

  const handleEditPermissions = (user: User) => {
    setEditingUser(user);
    setEditingPermissions(user.permissions);
    setIsPermissionModalOpen(true);
  };

  const handleToggleActive = (user: User, isActive: boolean) => {
    dispatch(toggleUserActive({ id: user.id, isActive }));
    message.success(isActive ? '用户已启用' : '用户已禁用');
  };

  const handleUpdateRole = (user: User, role: User['role']) => {
    dispatch(updateUserRole({ id: user.id, role }));
    message.success('角色已更新');
  };

  const handleSavePermissions = () => {
    if (editingUser) {
      dispatch(updateUserPermissions({ id: editingUser.id, permissions: editingPermissions }));
      message.success('权限已更新');
      setIsPermissionModalOpen(false);
    }
  };

  const handleRefreshLogs = () => {
    dispatch(fetchOperationLogs());
    message.success('日志已刷新');
  };

  const getRoleTag = (role: User['role']) => {
    const config = ROLE_CONFIG[role];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const userColumns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              账号: {record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleUpdateRole(record, value as User['role'])}
          style={{ width: 120 }}
        >
          <Option value="admin">系统管理员</Option>
          <Option value="dispatcher">调度员</Option>
          <Option value="operator">运维人员</Option>
        </Select>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (time) => (
        <Text type="secondary">{new Date(time).toLocaleString('zh-CN')}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleEditPermissions(record)}>
            权限
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns: ColumnsType<OperationLog> = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => (
        <Text type="secondary">{new Date(time).toLocaleString('zh-CN')}</Text>
      ),
    },
    {
      title: '操作用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 120,
    },
    {
      title: '操作详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (text, record) => (
        record.isSensitive ? (
          <Text type="secondary" style={{ fontStyle: 'italic' }}>*** 敏感操作已脱敏 ***</Text>
        ) : (
          text
        )
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '敏感操作',
      dataIndex: 'isSensitive',
      key: 'isSensitive',
      width: 100,
      render: (isSensitive) => (
        isSensitive ? (
          <Badge status="warning" text="是" />
        ) : (
          <Badge status="success" text="否" />
        )
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="总用户数"
            value={stats.total}
            suffix="人"
            icon={<UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="活跃用户"
            value={stats.active}
            suffix="人"
            icon={<UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
            color="#52c41a"
            progress={(stats.active / stats.total) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="调度员"
            value={stats.dispatchers}
            suffix="人"
            icon={<SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="管理员"
            value={stats.admins}
            suffix="人"
            icon={<SafetyOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
            color="#ff4d4f"
          />
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="账号管理" key="users" icon={<UserOutlined />}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Space wrap>
                <Search
                  placeholder="搜索用户名、姓名、电话"
                  allowClear
                  style={{ width: 280 }}
                  onSearch={setSearchText}
                  prefix={<SearchOutlined />}
                />
                <Select
                  placeholder="角色筛选"
                  allowClear
                  style={{ width: 150 }}
                  onChange={setSelectedRole}
                >
                  <Option value="admin">系统管理员</Option>
                  <Option value="dispatcher">调度员</Option>
                  <Option value="operator">运维人员</Option>
                </Select>
              </Space>
              <Space>
                <Button icon={<PlusOutlined />}>
                  新增用户
                </Button>
              </Space>
            </div>

            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="角色权限" key="roles" icon={<SafetyOutlined />}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card title="系统管理员">
                  <Tag color="error" style={{ marginBottom: 12 }}>超级权限</Tag>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="权限范围">
                      <Text type="secondary">所有模块的完整权限</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="用户数量">
                      {stats.admins} 人
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Text strong>权限列表:</Text>
                  <List
                    size="small"
                    dataSource={['订单管理', '车辆管理', '司机管理', '配置管理', '用户管理', '报表导出']}
                    renderItem={(item) => (
                      <List.Item>
                        <Tag color="success">{item}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="调度员">
                  <Tag color="blue" style={{ marginBottom: 12 }}>业务操作</Tag>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="权限范围">
                      <Text type="secondary">订单调度、车辆和司机查看</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="用户数量">
                      {stats.dispatchers} 人
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Text strong>权限列表:</Text>
                  <List
                    size="small"
                    dataSource={['订单读取', '订单派单', '车辆读取', '司机读取']}
                    renderItem={(item) => (
                      <List.Item>
                        <Tag color="blue">{item}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="运维人员">
                  <Tag color="green" style={{ marginBottom: 12 }}>监控运维</Tag>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="权限范围">
                      <Text type="secondary">配置查看、告警监控、报表查看</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="用户数量">
                      {stats.operators} 人
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Text strong>权限列表:</Text>
                  <List
                    size="small"
                    dataSource={['配置读取', '告警读取', '报表读取']}
                    renderItem={(item) => (
                      <List.Item>
                        <Tag color="green">{item}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="操作日志" key="logs" icon={<ClockCircleOutlined />}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={handleRefreshLogs} loading={loading}>
                刷新日志
              </Button>
            </div>

            <Table
              columns={logColumns}
              dataSource={operationLogs}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title="用户详情"
        width={500}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedUser && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="头像">
                  <Avatar size={64} icon={<UserOutlined />} />
                </Descriptions.Item>
                <Descriptions.Item label="姓名">
                  {selectedUser.name}
                </Descriptions.Item>
                <Descriptions.Item label="账号">
                  {selectedUser.username}
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  {getRoleTag(selectedUser.role)}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {selectedUser.phone}
                </Descriptions.Item>
                <Descriptions.Item label="账号状态">
                  {selectedUser.isActive ? (
                    <Tag color="success">正常</Tag>
                  ) : (
                    <Tag color="error">已禁用</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="最后登录">
                  {new Date(selectedUser.lastLogin).toLocaleString('zh-CN')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card type="inner" title="权限列表">
              {selectedUser.permissions.includes('all') ? (
                <Tag color="error">超级管理员 - 拥有所有权限</Tag>
              ) : (
                <Space wrap>
                  {selectedUser.permissions.map((perm) => (
                    <Tag key={perm} color="blue">{perm}</Tag>
                  ))}
                </Space>
              )}
            </Card>

            <Divider />

            <Space>
              <Button onClick={() => {
                handleEditPermissions(selectedUser);
                setIsDrawerOpen(false);
              }}>
                编辑权限
              </Button>
              <Popconfirm
                title={selectedUser.isActive ? '禁用用户' : '启用用户'}
                description={selectedUser.isActive ? '确定要禁用此用户吗？' : '确定要启用此用户吗？'}
                onConfirm={() => handleToggleActive(selectedUser, !selectedUser.isActive)}
              >
                <Button danger={selectedUser.isActive}>
                  {selectedUser.isActive ? '禁用用户' : '启用用户'}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title="编辑用户权限"
        open={isPermissionModalOpen}
        onCancel={() => setIsPermissionModalOpen(false)}
        onOk={handleSavePermissions}
        width={600}
      >
        <div>
          {editingUser && (
            <div style={{ marginBottom: 16 }}>
              <Text>正在编辑用户: </Text>
              <Text strong>{editingUser.name}</Text>
              <Text type="secondary"> ({editingUser.username})</Text>
            </div>
          )}

          {editingUser?.permissions.includes('all') ? (
            <div style={{ padding: 16, background: '#fff2f0', borderRadius: 8 }}>
              <Text strong style={{ color: '#ff4d4f' }}>
                该用户是超级管理员，拥有所有权限，无法单独编辑权限。
              </Text>
            </div>
          ) : (
            <Form layout="vertical">
              <Form.Item label="权限配置">
                <CheckboxGroup
                  options={ALL_PERMISSIONS}
                  value={editingPermissions}
                  onChange={(values) => setEditingPermissions(values as string[])}
                />
              </Form.Item>
            </Form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SystemPermissions;
