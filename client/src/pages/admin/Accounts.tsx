import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi, departmentApi } from '@/services/api';
import type { User, Department } from '@/types';

const roleMap: Record<string, { text: string; color: string }> = {
  super_admin: { text: '超级管理员', color: 'red' },
  hospital_admin: { text: '院办', color: 'orange' },
  doctor: { text: '医生', color: 'blue' },
  nurse: { text: '护士', color: 'cyan' },
  finance: { text: '财务', color: 'green' },
  pharmacist: { text: '药剂', color: 'purple' },
  technician: { text: '医技', color: 'geekblue' },
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountRes, deptRes] = await Promise.all([
        adminApi.getAccounts(),
        departmentApi.getAll(),
      ]);
      setAccounts(accountRes);
      setDepartments(deptRes);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingAccount(record);
    form.setFieldsValue({
      username: record.username,
      real_name: record.real_name,
      phone: record.phone,
      role: record.role,
      department_id: record.department_id,
      title: record.title,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: Partial<User> & { password?: string }) => {
    try {
      if (editingAccount) {
        await adminApi.updateAccount(editingAccount.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createAccount(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      // error handled
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      await adminApi.resetPassword(id);
      message.success('密码已重置为 123456');
    } catch {
      // error handled
    }
  };

  const handleToggleStatus = async (record: User, checked: boolean) => {
    try {
      await adminApi.updateAccount(record.id, { is_active: checked ? 1 : 0 });
      message.success(checked ? '已启用' : '已禁用');
      fetchData();
    } catch {
      // error handled
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleMap[role]?.color || 'default'}>{roleMap[role]?.text || role}</Tag>
      ),
    },
    { title: '科室', dataIndex: 'department_name', key: 'department_name' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: number, record: User) => (
        <Switch
          checked={active === 1}
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" onClick={() => handleResetPassword(record.id)}>
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">账号管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增账号
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingAccount ? '编辑账号' : '新增账号'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingAccount && (
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
          )}
          {!editingAccount && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" defaultValue="123456" />
            </Form.Item>
          )}
          <Form.Item
            name="real_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {Object.entries(roleMap).map(([key, val]) => (
                <Select.Option key={key} value={key}>
                  {val.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="department_id" label="科室">
            <Select placeholder="请选择科室">
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="title" label="职称">
            <Input placeholder="请输入职称" />
          </Form.Item>
          {editingAccount && (
            <Form.Item name="is_active" label="启用状态" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
