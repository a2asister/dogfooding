import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { categoryApi } from '@/services';
import type { CourseCategory } from '@/types';

const CategoryManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourseCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories();
      if (res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: CourseCategory) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
      sortOrder: record.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await categoryApi.deleteCategory(id);
      if (res.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        const res = await categoryApi.updateCategory(editingCategory.id, {
          name: values.name,
          code: values.code,
          description: values.description,
          sortOrder: values.sortOrder,
        });
        if (res.success) {
          message.success('更新成功');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await categoryApi.createCategory({
          name: values.name,
          code: values.code,
          description: values.description,
          sortOrder: values.sortOrder,
        });
        if (res.success) {
          message.success('创建成功');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ColumnsType<CourseCategory> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: CourseCategory, index: number) => index + 1,
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text: string) => text || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: CourseCategory) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增分类
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="分类编码"
            rules={[{ required: true, message: '请输入分类编码' }]}
          >
            <Input placeholder="请输入分类编码，如：GONGXUE" disabled={!!editingCategory} />
          </Form.Item>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称，如：公共选修课" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
          <Form.Item
            name="sortOrder"
            label="排序"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
