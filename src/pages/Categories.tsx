import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../types';

const { Option } = Select;
const { TabPane } = Tabs;

const Categories: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      const allCategories = storage.getCategories();
      const filteredCategories = allCategories.filter((c) => {
        if (isAdmin) return true;
        return c.isPublic || c.createdBy === currentUser?.id;
      });
      setCategories(filteredCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      type: activeTab,
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const category = storage.getCategoryById(id);
    if (category?.isSystem) {
      message.error('系统默认分类不能删除');
      return;
    }
    storage.deleteCategory(id);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '删除',
      module: '分类管理',
      description: `删除了分类: ${category?.name}`,
      details: { categoryId: id },
    });
    
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    const categoryData = {
      name: values.name,
      type: values.type,
      icon: values.icon,
      color: values.color,
      isPublic: values.isPublic,
      createdBy: currentUser!.id,
    };

    if (editingCategory) {
      if (editingCategory.isSystem) {
        message.error('系统默认分类不能编辑');
        return;
      }
      storage.updateCategory(editingCategory.id, categoryData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '编辑',
        module: '分类管理',
        description: `编辑了分类: ${values.name}`,
        details: { categoryId: editingCategory.id },
      });
      
      message.success('分类更新成功');
    } else {
      storage.addCategory(categoryData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '新增',
        module: '分类管理',
        description: `新增了分类: ${values.name}`,
        details: { name: values.name, type: values.type },
      });
      
      message.success('分类添加成功');
    }

    setIsModalOpen(false);
    loadData();
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string) => <span style={{ fontSize: 24 }}>{icon}</span>,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <Space>
          <div style={{ width: 20, height: 20, background: color, borderRadius: 4 }} />
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{color}</span>
        </Space>
      ),
    },
    {
      title: '属性',
      key: 'system',
      width: 100,
      render: (_: unknown, record: Category) => (
        <Space>
          {record.isSystem && (
            <Tag color="blue" icon={<LockOutlined />}>
              系统
            </Tag>
          )}
          <Tag color={record.isPublic ? 'blue' : 'orange'}>
            {record.isPublic ? '公开' : '私有'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.isSystem && !isAdmin}
          >
            编辑
          </Button>
          {!record.isSystem && (
            <Popconfirm title="确定要删除这个分类吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const iconOptions = ['💰', '💼', '🎁', '📈', '💪', '🍔', '🚗', '🛒', '🎮', '🏠', '🏥', '📚', '📱', '🎯', '⭐', '💎', '🏆', '🎨', '🎭', '🎪'];
  const colorOptions = ['#ff4d4f', '#52c41a', '#1890ff', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96', '#2f54eb', '#a0d911', '#8c8c8c'];

  return (
    <div className="categories-page">
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'income' | 'expense')}>
        <TabPane tab="支出分类" key="expense">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加分类
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="收入分类" key="income">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加分类
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：奶茶咖啡" />
          </Form.Item>

          <Form.Item name="type" label="分类类型" rules={[{ required: true }]}>
            <Select>
              <Option value="income">收入</Option>
              <Option value="expense">支出</Option>
            </Select>
          </Form.Item>

          <Form.Item name="icon" label="图标" rules={[{ required: true, message: '请选择图标' }]}>
            <Select placeholder="选择图标" optionLabelProp="label">
              {iconOptions.map((icon) => (
                <Option key={icon} value={icon} label={<span style={{ fontSize: 18 }}>{icon}</span>}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="color" label="颜色" rules={[{ required: true, message: '请选择颜色' }]}>
            <Select placeholder="选择颜色" optionLabelProp="label">
              {colorOptions.map((color) => (
                <Option key={color} value={color} label={<div style={{ width: 20, height: 20, background: color, borderRadius: 4, display: 'inline-block' }} />}>
                  <Space>
                    <div style={{ width: 20, height: 20, background: color, borderRadius: 4 }} />
                    <span>{color}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isPublic" label="公开可见" valuePropName="checked">
            <Select>
              <Option value={true}>公开（所有成员可见）</Option>
              <Option value={false}>私有（仅自己可见）</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? '保存修改' : '确认添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
