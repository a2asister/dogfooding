import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  message,
  Popconfirm,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, User } from '../types';

const { Option } = Select;

const Users: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    if (!isAdmin) {
      message.error('权限不足，无法访问用户管理');
      return;
    }
    setLoading(true);
    try {
      setUsers(storage.getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadData();
  }, [isAdmin]);

  const handleAdd = () => {
    if (!isAdmin) {
      message.error('权限不足，无法添加用户');
      return;
    }
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: UserRole.MEMBER,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: User) => {
    if (!isAdmin) {
      message.error('权限不足，无法编辑用户');
      return;
    }
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      message.error('权限不足，无法删除用户');
      return;
    }
    if (id === currentUser?.id) {
      message.error('不能删除当前登录的用户');
      return;
    }
    const user = storage.getUserById(id);
    storage.deleteUser(id);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '删除',
      module: '用户管理',
      description: `删除了用户: ${user?.name}`,
      details: { userId: id },
    });
    
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    if (!isAdmin) {
      message.error('权限不足，无法操作用户');
      return;
    }
    if (editingUser) {
      const updates: Partial<User> = {
        name: values.name,
        role: values.role,
        isActive: values.isActive,
      };
      if (values.password) {
        updates.password = values.password;
      }
      storage.updateUser(editingUser.id, updates);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '编辑',
        module: '用户管理',
        description: `编辑了用户: ${values.name}`,
        details: { userId: editingUser.id },
      });
      
      message.success('用户更新成功');
    } else {
      if (storage.getUserByUsername(values.username)) {
        message.error('用户名已存在');
        return;
      }
      
      const newUser = storage.addUser({
        username: values.username,
        password: values.password,
        name: values.name,
        role: values.role,
        isActive: values.isActive,
      });
      
      storage.addLog({
        userId: currentUser!.id,
        action: '新增',
        module: '用户管理',
        description: `新增了用户: ${values.name}`,
        details: { username: values.username, role: values.role },
      });
      
      message.success('用户添加成功');
    }

    setIsModalOpen(false);
    loadData();
  };

  const toggleUserStatus = (record: User) => {
    if (!isAdmin) {
      message.error('权限不足，无法修改用户状态');
      return;
    }
    if (record.id === currentUser?.id) {
      message.error('不能禁用当前登录的用户');
      return;
    }
    storage.updateUser(record.id, { isActive: !record.isActive });
    
    storage.addLog({
      userId: currentUser!.id,
      action: record.isActive ? '禁用' : '启用',
      module: '用户管理',
      description: `${record.isActive ? '禁用' : '启用'}了用户: ${record.name}`,
      details: { userId: record.id },
    });
    
    message.success(record.isActive ? '已禁用' : '已启用');
    loadData();
  };

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: () => (
        <Avatar size={32} icon={<UserOutlined />} />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === UserRole.ADMIN ? 'purple' : 'blue'}>
          {role === UserRole.ADMIN ? (
            <span><SafetyCertificateOutlined /> 管理员</span>
          ) : (
            <span><TeamOutlined /> 普通成员</span>
          )}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          checkedChildren="正常"
          unCheckedChildren="禁用"
          onChange={() => toggleUserStatus(record)}
          disabled={record.id === currentUser?.id}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: User) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingUser && (
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? '新密码（留空则不修改）' : '密码'}
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6个字符' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改密码' : '请输入密码'} />
          </Form.Item>

          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Option value={UserRole.ADMIN}>
                <SafetyCertificateOutlined /> 管理员
              </Option>
              <Option value={UserRole.MEMBER}>
                <TeamOutlined /> 普通成员
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="状态" valuePropName="checked">
            <Select>
              <Option value={true}>正常</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '保存修改' : '确认添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
