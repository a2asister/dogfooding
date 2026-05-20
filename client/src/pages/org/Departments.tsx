import { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import request from '../../utils/request';

const Departments: React.FC = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [parentId, setParentId] = useState<number>(0);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res: any = await request.get('/departments/tree');
    if (res.code === 0) {
      const buildTree = (items: any[]): DataNode[] => {
        return items.map((item) => ({
          key: item.id,
          title: item.name,
          children: item.children ? buildTree(item.children) : [],
          ...item,
        }));
      };
      setTreeData(buildTree(res.data));
    }
  };

  const handleAdd = (parent: number = 0) => {
    setEditingRecord(null);
    setParentId(parent);
    form.resetFields();
    form.setFieldsValue({ parentId: parent });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.title,
      code: record.code,
      parentId: record.parentId,
      leaderId: record.leaderId,
      description: record.description,
      sortOrder: record.sortOrder,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/departments/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    } else {
      message.error(res.message);
    }
  };

  const handleSubmit = async (values: any) => {
    if (editingRecord) {
      const res: any = await request.put(`/departments/${editingRecord.key}`, values);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      }
    } else {
      const res: any = await request.post('/departments', { ...values, parentId });
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      }
    }
  };

  const renderTitle = (node: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <span>{node.title}</span>
      <Space size="small">
        <Button type="text" size="small" icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation(); handleAdd(node.key); }} />
        <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(node); }} />
        <Popconfirm title="确定删除?" onConfirm={(e) => { e?.stopPropagation(); handleDelete(node.key); }}>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>部门管理</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(0)}>新增根部门</Button>
      </div>
      <Card>
        <Tree
          showLine
          blockNode
          treeData={treeData}
          titleRender={renderTitle}
          defaultExpandAll
        />
      </Card>
      <Modal
        title={editingRecord ? '编辑部门' : '新增部门'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="部门编码">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" />
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

export default Departments;
