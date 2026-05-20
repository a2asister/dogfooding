import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space, Popconfirm, Tag, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Indicators: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadCategories();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/indicators', {
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

  const loadCategories = async () => {
    const res: any = await request.get('/indicators/categories');
    if (res.code === 0) {
      const flatten = (items: any[]): any[] => {
        return items.flatMap((item) => [item, ...flatten(item.children || [])]);
      };
      setCategories(flatten(res.data));
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
      categoryId: record.categoryId,
      type: record.type,
      description: record.description,
      measurementUnit: record.measurementUnit,
      calculationFormula: record.calculationFormula,
      scoringCriteria: record.scoringCriteria,
      targetValue: record.targetValue,
      weight: record.weight,
      isStandard: record.isStandard,
      applicablePositions: record.applicablePositions,
      status: record.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/indicators/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    }
  };

  const handleSubmit = async (values: any) => {
    const data = { ...values, status: values.status ? 1 : 0 };
    if (editingRecord) {
      const res: any = await request.put(`/indicators/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      }
    } else {
      const res: any = await request.post('/indicators', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      }
    }
  };

  const columns = [
    { title: '指标名称', dataIndex: 'name' },
    { title: '指标编码', dataIndex: 'code' },
    { title: '分类', dataIndex: 'categoryName' },
    { title: '类型', dataIndex: 'type', render: (v: string) => v === 'quantitative' ? <Tag color="blue">量化</Tag> : <Tag color="orange">定性</Tag> },
    { title: '计量单位', dataIndex: 'measurementUnit' },
    { title: '目标值', dataIndex: 'targetValue' },
    { title: '标准模板', dataIndex: 'isStandard', render: (v: number) => v ? <Tag color="green">是</Tag> : '否' },
    { title: '状态', dataIndex: 'status', render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
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
      <Tabs
        items={[
          {
            key: '1',
            label: '指标列表',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3>指标库</h3>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增指标</Button>
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
              </>
            ),
          },
          {
            key: '2',
            label: '标准模板库',
            children: <div>互联网多岗位标准KPI模板预设与复用</div>,
          },
        ]}
      />
      <Modal
        title={editingRecord ? '编辑指标' : '新增指标'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="name" label="指标名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="code" label="指标编码">
              <Input />
            </Form.Item>
            <Form.Item name="categoryId" label="分类">
              <Select>
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="quantitative">量化指标</Select.Option>
                <Select.Option value="qualitative">定性指标</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="measurementUnit" label="计量单位">
              <Input />
            </Form.Item>
            <Form.Item name="targetValue" label="目标值">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="weight" label="默认权重(%)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="isStandard" label="标准模板" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item name="calculationFormula" label="计算公式">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="scoringCriteria" label="评分标准" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="请详细描述评分规则，如：达到目标值得100分，每低10%扣5分" />
          </Form.Item>
          <Form.Item name="description" label="指标说明">
            <Input.TextArea rows={2} />
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

export default Indicators;
