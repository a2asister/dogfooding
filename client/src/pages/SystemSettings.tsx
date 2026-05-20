import { useState, useEffect } from 'react';
import { Tabs, Table, Tag, Space, Input, Select, Card, Row, Col, Button, Modal, Form, message, Switch } from 'antd';
import { PlusOutlined, ReloadOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { envApi, userApi, Environment, User } from '../api';
import { useAuthStore } from '../store/auth';

export default function SystemSettings() {
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'admin';
  const [activeTab, setActiveTab] = useState('environment');
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [envModalVisible, setEnvModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [envForm] = Form.useForm();
  const [userForm] = Form.useForm();

  const loadEnvs = async () => {
    setLoading(true);
    try {
      const data = await envApi.getAll();
      setEnvs(data);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getList({ pageSize: 100 });
      setUsers(data.list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'environment') {
      loadEnvs();
    } else if (activeTab === 'user') {
      loadUsers();
    }
  }, [activeTab]);

  const handleEnvSubmit = async (values: any) => {
    try {
      await envApi.create(values);
      message.success('创建成功');
      setEnvModalVisible(false);
      envForm.resetFields();
      loadEnvs();
    } catch (err) {
      // Error handled
    }
  };

  const handleUserSubmit = async (values: any) => {
    try {
      await userApi.create(values);
      message.success('创建成功');
      setUserModalVisible(false);
      userForm.resetFields();
      loadUsers();
    } catch (err) {
      // Error handled
    }
  };

  const handleToggleUser = async (user: User) => {
    try {
      await userApi.update(user.id, { enabled: !user.enabled });
      message.success('更新成功');
      loadUsers();
    } catch (err) {
      // Error handled
    }
  };

  const envColumns = [
    { title: '环境名称', dataIndex: 'name', key: 'name' },
    { title: '环境编码', dataIndex: 'code', key: 'code' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) => <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>,
    },
  ];

  const userColumns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role === 'admin' ? '管理员' : '普通用户'}</Tag>,
    },
    {
      title: '状态',
      key: 'enabled',
      width: 100,
      render: (_: any, record: User) => (
        <Switch checked={record.enabled} onChange={() => handleToggleUser(record)} disabled={record.username === 'admin'} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (t: string) => new Date(t).toLocaleString(),
    },
  ];

  const tabItems = [
    {
      key: 'environment',
      label: (
        <span>
          <EnvironmentOutlined /> 环境管理
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Space style={{ float: 'right' }}>
                <Button icon={<ReloadOutlined />} onClick={loadEnvs}>
                  刷新
                </Button>
                {isAdmin && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setEnvModalVisible(true)}>
                    新建环境
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
          <Table columns={envColumns} dataSource={envs} rowKey="id" loading={loading} pagination={false} />
        </div>
      ),
    },
    {
      key: 'user',
      label: (
        <span>
          <UserOutlined /> 用户管理
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Space style={{ float: 'right' }}>
                <Button icon={<ReloadOutlined />} onClick={loadUsers}>
                  刷新
                </Button>
                {isAdmin && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalVisible(true)}>
                    新建用户
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
          <Table columns={userColumns} dataSource={users} rowKey="id" loading={loading} pagination={false} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal title="新建环境" open={envModalVisible} onCancel={() => setEnvModalVisible(false)} footer={null}>
        <Form form={envForm} layout="vertical" onFinish={handleEnvSubmit}>
          <Form.Item name="name" label="环境名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="环境编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
              <Button onClick={() => setEnvModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="新建用户" open={userModalVisible} onCancel={() => setUserModalVisible(false)} footer={null}>
        <Form form={userForm} layout="vertical" onFinish={handleUserSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]} initialValue="user">
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
