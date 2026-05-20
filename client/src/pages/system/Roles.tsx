import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Tag, Transfer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const allPermissions = [
  { key: 'user:*', title: '用户管理' },
  { key: 'role:*', title: '角色管理' },
  { key: 'department:*', title: '部门管理' },
  { key: 'employee:*', title: '员工管理' },
  { key: 'indicator:*', title: '指标管理' },
  { key: 'scheme:*', title: '方案管理' },
  { key: 'plan:*', title: '计划管理' },
  { key: 'kpi:*', title: 'KPI管理' },
  { key: 'result:*', title: '结果管理' },
  { key: 'statistics:*', title: '统计分析' },
  { key: 'system:*', title: '系统配置' },
];

const Roles: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/roles');
      if (res.code === 0) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
      permissions: record.permissions || [],
      status: record.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/roles/${id}`);
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
      const res: any = await request.put(`/roles/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      } else {
        message.error(res.message);
      }
    } else {
      const res: any = await request.post('/roles', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      } else {
        message.error(res.message);
      }
    }
  };

  const columns = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色编码', dataIndex: 'code', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '描述', dataIndex: 'description' },
    { title: '用户数', dataIndex: 'userCount' },
    { title: '系统预设', dataIndex: 'isSystem', render: (v: number) => v ? <Tag color="green">是</Tag> : '否' },
    { title: '状态', dataIndex: 'status', render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} disabled={record.isSystem}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger disabled={record.isSystem || record.userCount > 0}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>角色管理</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增角色</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
            <Input prefix={<KeyOutlined />} disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="permissions" label="权限分配">
            <Transfer
              dataSource={allPermissions}
              titles={['可选权限', '已选权限']}
              targetKeys={form.getFieldValue('permissions') || []}
              render={(item) => item.title}
              onChange={(nextTargetKeys) => form.setFieldsValue({ permissions: nextTargetKeys })}
              rowKey={(item) => item.key}
              listStyle={{ width: 300, height: 300 }}
            />
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

export default Roles;
