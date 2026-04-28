import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  message,
  Descriptions,
  Divider,
  Form,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LockOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi } from '../../services/api';
import { User, UserStatus, UserRole } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const statusMap: Record<UserStatus, { label: string; color: string }> = {
    active: { label: '正常', color: 'success' },
    inactive: { label: '停用', color: 'default' },
    suspended: { label: '冻结', color: 'warning' }
  };

  const roleMap: Record<UserRole, { label: string; color: string }> = {
    admin: { label: '超级管理员', color: 'red' },
    manager: { label: '管理员', color: 'purple' },
    operator: { label: '操作员', color: 'blue' },
    courier: { label: '快递员', color: 'green' },
    customer: { label: '客户', color: 'default' }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: User) => {
    setSelectedUser(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setFormMode('edit');
    setSelectedUser(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleDelete = async (record: User) => {
    if (record.role === UserRole.ADMIN) {
      message.error('无法删除管理员用户');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${record.name || record.username}」吗？`,
      onOk: async () => {
        try {
          const result = await userApi.delete(record.id);
          if (result.success) {
            message.success('删除成功');
            loadUsers();
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadUsers();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      role: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (formMode === 'create') {
        if (!values.password) {
          message.error('请输入密码');
          return;
        }
        const result = await userApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadUsers();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedUser) {
        const { password, ...updateValues } = values;
        const result = await userApi.update(selectedUser.id, updateValues);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadUsers();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleStatusChange = async (record: User, status: UserStatus) => {
    try {
      const result = await userApi.updateStatus(record.id, status);
      if (result.success) {
        message.success('状态更新成功');
        loadUsers();
      } else {
        message.error(result.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('状态更新失败');
    }
  };

  const handleResetPassword = (record: User) => {
    setSelectedUser(record);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (selectedUser) {
        const result = await userApi.resetPassword(selectedUser.id, values.newPassword);
        if (result.success) {
          message.success('密码重置成功');
          setPasswordModalVisible(false);
        } else {
          message.error(result.message || '密码重置失败');
        }
      }
    } catch (error) {
      console.error('密码重置失败:', error);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (email: string) => email || '-'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: UserRole) => {
        const roleInfo = roleMap[role] || roleMap.customer;
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus) => {
        const statusInfo = statusMap[status] || statusMap.inactive;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Select
            placeholder="状态"
            style={{ width: 80 }}
            value={record.status}
            onChange={(value) => handleStatusChange(record, value)}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          {record.role !== UserRole.ADMIN && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      )
    }
  ];

  const tablePagination = {
    ...pagination,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`,
    onChange: (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>人员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增用户
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索用户名/姓名/电话"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="角色"
            style={{ width: 120 }}
            allowClear
            value={searchParams.role}
            onChange={(value) => setSearchParams(prev => ({ ...prev, role: value }))}
          >
            {Object.entries(roleMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={tablePagination}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedUser && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
              <Descriptions.Item label="姓名">{selectedUser.name}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedUser.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedUser.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color={roleMap[selectedUser.role]?.color}>
                  {roleMap[selectedUser.role]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedUser.status]?.color}>
                  {statusMap[selectedUser.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {selectedUser.lastLoginAt ? dayjs(selectedUser.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedUser.createdAt ? dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增用户' : '编辑用户'}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        width={600}
        onOk={handleFormSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={formMode === 'edit'} />
          </Form.Item>

          {formMode === 'create' && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {Object.entries(roleMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        width={500}
        onOk={handlePasswordSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
