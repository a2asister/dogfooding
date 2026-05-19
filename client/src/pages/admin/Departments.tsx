import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { departmentApi } from '@/services/api';
import type { Department } from '@/types';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDept(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Department) => {
    setEditingDept(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      sort_order: record.sort_order,
      icon: record.icon,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: Partial<Department>) => {
    try {
      if (editingDept) {
        await departmentApi.update(editingDept.id, values);
        message.success('更新成功');
      } else {
        await departmentApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch {
      // error handled
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await departmentApi.delete(id);
      message.success('删除成功');
      fetchDepartments();
    } catch {
      // error handled
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '图标', dataIndex: 'icon', key: 'icon', width: 80, render: (icon: string) => icon || '🏥' },
    { title: '科室名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active: number) => (
        <Switch checked={active === 1} disabled />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Department) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">科室管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增科室
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingDept ? '编辑科室' : '新增科室'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="科室名称"
            rules={[{ required: true, message: '请输入科室名称' }]}
          >
            <Input placeholder="请输入科室名称" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入emoji图标" maxLength={2} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入科室描述" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <Input type="number" placeholder="请输入排序号" />
          </Form.Item>
          {editingDept && (
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
