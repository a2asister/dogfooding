import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, message, Card, Avatar } from 'antd';
import { UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { userApi, authApi } from '@/api';
import type { User, UserRole } from '@/types';
import dayjs from 'dayjs';

function Users(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const [userResult, meResult] = await Promise.all([
        userApi.list({ page: 1, pageSize: 100 }),
        authApi.getMe(),
      ]);
      setUsers(userResult.users as User[]);
      setCurrentUser(meResult.user as User);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (values: { role: string }): Promise<void> => {
    if (!editingUser) return;
    try {
      await userApi.updateRole(editingUser.id, values.role);
      message.success('角色更新成功');
      setRoleModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchData();
    } catch {
      // ignore
    }
  };

  const getRoleTag = (role: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      admin: { color: 'red', text: '管理员' },
      developer: { color: 'blue', text: '开发人员' },
      tester: { color: 'cyan', text: '测试人员' },
      viewer: { color: 'default', text: '查看者' },
    };
    const t = map[role] || { color: 'default', text: role };
    return (
      <Tag color={t.color} icon={<SafetyOutlined />}>
        {t.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar size={36} src={record.avatarUrl} icon={<UserOutlined />}>
            {record.username?.[0]?.toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <strong>{record.username}</strong>
            <span style={{ color: '#888', fontSize: 12 }}>{record.email}</span>
          </Space>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => getRoleTag(role),
    },
    {
      title: 'GitHub ID',
      dataIndex: 'githubId',
      key: 'githubId',
      width: 120,
      render: (id: number) => id || '-',
    },
    {
      title: 'Token 过期',
      dataIndex: 'tokenExpiresAt',
      key: 'tokenExpiresAt',
      width: 180,
      render: (time: number) => {
        if (!time) return <Tag color="default">未授权</Tag>;
        const expired = time < Date.now();
        return (
          <Tag color={expired ? 'red' : 'green'}>
            {expired ? '已过期' : dayjs(time).format('YYYY-MM-DD HH:mm')}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: User) => {
        const isCurrentUser = currentUser?.id === record.id;
        const canEdit = currentUser?.role === 'admin' && !isCurrentUser;
        return (
          <Button
            type="link"
            disabled={!canEdit}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({ role: record.role });
              setRoleModalVisible(true);
            }}
          >
            修改角色
          </Button>
        );
      },
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个用户` }}
      />

      <Modal
        title={`修改用户角色 - ${editingUser?.username}`}
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateRole}>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="developer">开发人员</Select.Option>
              <Select.Option value="tester">测试人员</Select.Option>
              <Select.Option value="viewer">查看者</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default Users;
