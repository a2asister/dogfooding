import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { userApi, organizationApi } from '../services/api';
import { User, UserRole, USER_ROLE_OPTIONS } from '../types';

const { Option } = Select;

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ keyword: '', role: '', departmentId: '', status: '' });
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadOrganizations = async () => {
    try {
      const response = await organizationApi.getOrganizations();
      setOrganizations(response.data);
    } catch (error) {
      console.error('加载组织架构失败', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      });
      setUsers(response.data.items);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      message.success('删除成功');
      loadUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let res;
      if (editingUser) {
        res = await userApi.updateUser(editingUser.id, values);
        if (res.code === 0) {
          message.success('更新成功');
          setIsModalVisible(false);
          loadUsers();
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        res = await userApi.createUser(values);
        if (res.code === 0) {
          message.success('创建成功');
          setIsModalVisible(false);
          loadUsers();
        } else {
          message.error(res.message || '创建失败');
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => {
        const option = USER_ROLE_OPTIONS.find(o => o.value === role);
        return option?.label || role;
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status === 'active' ? '正常' : '禁用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Space>
          <Input
            placeholder="搜索用户名/姓名/邮箱"
            style={{ width: 200 }}
            allowClear
            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
          />
          <Select
            placeholder="角色筛选"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters(prev => ({ ...prev, role: value || '' }))}
          >
            {USER_ROLE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadUsers}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建用户
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              {USER_ROLE_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="departmentId" label="所属部门">
            <Select
              showSearch
              placeholder="请选择部门"
              optionFilterProp="children"
            >
              {organizations.map(org => (
                <Option key={org.id} value={org.id}>{org.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态">
              <Select>
                <Option value="active">正常</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
