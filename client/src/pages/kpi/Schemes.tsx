import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Schemes: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadIndicators();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/schemes', {
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

  const loadIndicators = async () => {
    const res: any = await request.get('/indicators', { params: { pageSize: 1000 } });
    if (res.code === 0) setIndicators(res.data.list);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedIndicators([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      applicablePositions: record.applicablePositions,
    });
    setSelectedIndicators(record.indicators || []);
    setModalOpen(true);
  };

  const handleView = async (record: any) => {
    const res: any = await request.get(`/schemes/${record.id}`);
    if (res.code === 0) {
      setDetailRecord(res.data);
      setDetailOpen(true);
    }
  };

  const handleValidate = async (record: any) => {
    const res: any = await request.post(`/schemes/${record.id}/validate`);
    if (res.code === 0) {
      if (res.data.isValid) {
        message.success('校验通过');
      } else {
        message.error(res.data.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/schemes/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    }
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      indicators: selectedIndicators,
    };
    if (editingRecord) {
      const res: any = await request.put(`/schemes/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      }
    } else {
      const res: any = await request.post('/schemes', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      }
    }
  };

  const addIndicator = () => {
    setSelectedIndicators([...selectedIndicators, { indicatorId: null, weight: 0 }]);
  };

  const removeIndicator = (index: number) => {
    setSelectedIndicators(selectedIndicators.filter((_, i) => i !== index));
  };

  const updateIndicator = (index: number, field: string, value: any) => {
    const updated = [...selectedIndicators];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedIndicators(updated);
  };

  const totalWeight = selectedIndicators.reduce((sum, i) => sum + (i.weight || 0), 0);

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    enabled: { color: 'green', text: '已启用' },
    disabled: { color: 'red', text: '已禁用' },
  };

  const columns = [
    { title: '方案名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    { title: '适用岗位', dataIndex: 'applicablePositions', render: (v: string[]) => v?.join(', ') || '-' },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建人', dataIndex: 'creatorName' },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)}>查看</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button icon={<CheckOutlined />} size="small" onClick={() => handleValidate(record)}>校验</Button>
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
        <h3>考核方案</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增方案</Button>
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
        title={editingRecord ? '编辑方案' : '新增方案'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="方案名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="方案描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="指标配置">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已选指标总权重: <Tag color={Math.abs(totalWeight - 100) < 0.01 ? 'green' : 'red'}>{totalWeight}%</Tag></span>
                <Button size="small" onClick={addIndicator}>添加指标</Button>
              </div>
              {selectedIndicators.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Select
                    style={{ flex: 1 }}
                    value={item.indicatorId}
                    onChange={(v) => updateIndicator(index, 'indicatorId', v)}
                    placeholder="选择指标"
                  >
                    {indicators.map((i) => (
                      <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                    ))}
                  </Select>
                  <Input
                    style={{ width: 120 }}
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateIndicator(index, 'weight', Number(e.target.value))}
                    placeholder="权重(%)"
                  />
                  <Button danger size="small" onClick={() => removeIndicator(index)}>删除</Button>
                </div>
              ))}
            </div>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确定</Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="方案详情"
        placement="right"
        onClose={() => setDetailOpen(false)}
        open={detailOpen}
        width={600}
      >
        {detailRecord && (
          <div>
            <h4>{detailRecord.name}</h4>
            <p>{detailRecord.description}</p>
            <h5>指标列表</h5>
            <Table
              dataSource={detailRecord.indicators || []}
              columns={[
                { title: '指标名称', dataIndex: 'indicatorName' },
                { title: '类型', dataIndex: 'indicatorType' },
                { title: '权重', dataIndex: 'weight', render: (v: number) => `${v}%` },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Schemes;
