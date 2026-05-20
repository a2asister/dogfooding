import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Users: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadRoles();
    loadDepartments();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/users', {
        params: { page: pagination.current, pageSize: pagination.pageSize },
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    const res: any = await request.get('/roles/all');
    if (res.code === 0) setRoles(res.data);
  };

  const loadDepartments = async () => {
    const res: any = await request.get('/departments');
    if (res.code === 0) setDepartments(res.data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      username: record.username,
      realName: record.realName,
      email: record.email,
      phone: record.phone,
      roleId: record.roleId,
      departmentId: record.departmentId,
      position: record.position,
      status: record.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/users/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    } else {
      message.error(res.message);
    }
  };

  const handleSubmit = async (values: any) => {
    const data = { ...values, status: values.status ? 1 : 0 };
    if (editingRecord) {
      const res: any = await request.put(`/users/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      } else {
        message.error(res.message);
      }
    } else {
      const res: any = await request.post('/users', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      } else {
        message.error(res.message);
      }
    }
  };

  const handleToggleStatus = async (record: any, checked: boolean) => {
    const res: any = await request.put(`/users/${record.id}/status`, { status: checked ? 1 : 0 });
    if (res.code === 0) {
      message.success(checked ? '启用成功' : '禁用成功');
      loadData();
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username' },
    { title: '真实姓名', dataIndex: 'realName' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '角色', dataIndex: 'roleName' },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '状态', dataIndex: 'status', render: (v: number, record: any) => (
      <Switch checked={v === 1} onChange={(checked) => handleToggleStatus(record, checked)} size="small" />
    ) },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>用户管理</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />
      <Modal
        title={editingRecord ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingRecord} />
          </Form.Item>
          {!editingRecord && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password placeholder="默认123456" />
            </Form.Item>
          )}
          <Form.Item name="realName" label="真实姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="角色" rules={[{ required: true }]}>
            <Select>
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="departmentId" label="部门">
            <Select>
              {departments.map((d: any) => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="position" label="岗位">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确定</Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
