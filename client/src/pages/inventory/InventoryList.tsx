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
  InputNumber,
  Radio
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { inventoryApi } from '../../services/api';
import type { InventoryItem, InventoryType, InventoryStatus } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const InventoryList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as InventoryStatus | undefined,
    type: undefined as InventoryType | undefined
  });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();

  const typeMap: Record<InventoryType, { label: string; color: string }> = {
    package_material: { label: '包装材料', color: 'blue' },
    tool: { label: '工具', color: 'green' },
    office_supply: { label: '办公用品', color: 'purple' },
    other: { label: '其他', color: 'default' }
  };

  const statusMap: Record<InventoryStatus, { label: string; color: string }> = {
    in_stock: { label: '在库', color: 'success' },
    low_stock: { label: '低库存', color: 'warning' },
    out_of_stock: { label: '缺货', color: 'error' }
  };

  useEffect(() => {
    loadInventory();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const result = await inventoryApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载仓储物料列表失败:', error);
      message.error('加载仓储物料列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: InventoryItem) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: InventoryItem) => {
    setFormMode('edit');
    setSelectedItem(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'package_material' as InventoryType,
      status: 'in_stock' as InventoryStatus,
      unit: '个',
      currentStock: 0,
      minStock: 10
    });
    setFormModalVisible(true);
  };

  const handleDelete = async (record: InventoryItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除物料「${record.name}」吗？`,
      onOk: async () => {
        try {
          const result = await inventoryApi.delete(record.id);
          if (result.success) {
            message.success('删除成功');
            loadInventory();
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

  const handleStock = (record: InventoryItem) => {
    setSelectedItem(record);
    stockForm.resetFields();
    stockForm.setFieldsValue({
      type: 'in',
      quantity: 1,
      currentStock: record.currentStock
    });
    setStockModalVisible(true);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadInventory();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      type: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (formMode === 'create') {
        const result = await inventoryApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadInventory();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedItem) {
        const result = await inventoryApi.update(selectedItem.id, values);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadInventory();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleStockSubmit = async () => {
    try {
      const values = await stockForm.validateFields();
      if (selectedItem) {
        const result = await inventoryApi.updateStock(selectedItem.id, {
          quantity: values.quantity,
          type: values.type,
          remark: values.remark
        });
        if (result.success) {
          message.success(values.type === 'in' ? '入库成功' : '出库成功');
          setStockModalVisible(false);
          loadInventory();
        } else {
          message.error(result.message || '操作失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'SKU编码',
      dataIndex: 'sku',
      key: 'sku',
      width: 120
    },
    {
      title: '物料名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: InventoryType) => {
        const typeInfo = typeMap[type] || typeMap.other;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (value: number, record: InventoryItem) => {
        const unit = record.unit || '个';
        let stockColor = 'black';
        if (value === 0) stockColor = 'red';
        else if (value <= record.minStock) stockColor = 'orange';
        return <span style={{ color: stockColor, fontWeight: 'bold' }}>{value} {unit}</span>;
      }
    },
    {
      title: '最低库存',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 80,
      render: (value: number, record: InventoryItem) => `${value} ${record.unit || '个'}`
    },
    {
      title: '最高库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: 80,
      render: (value: number, record: InventoryItem) => value ? `${value} ${record.unit || '个'}` : '-'
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (value: number) => value ? `¥${value}` : '-'
    },
    {
      title: '总价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      render: (value: number) => value ? `¥${value}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: InventoryStatus) => {
        const statusInfo = statusMap[status] || statusMap.in_stock;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (value: string) => value || '-'
    },
    {
      title: '最后盘点时间',
      dataIndex: 'lastStocktakingAt',
      key: 'lastStocktakingAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: InventoryItem) => (
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
            icon={<ImportOutlined />}
            onClick={() => handleStock(record)}
          >
            入库
          </Button>
          <Button
            type="link"
            icon={<ExportOutlined />}
            onClick={() => handleStock(record)}
          >
            出库
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
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
        <h2>仓储物料管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增物料
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索SKU/名称/位置"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="物料类型"
            style={{ width: 120 }}
            allowClear
            value={searchParams.type}
            onChange={(value) => setSearchParams(prev => ({ ...prev, type: value }))}
          >
            {Object.entries(typeMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="库存状态"
            style={{ width: 100 }}
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
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title="物料详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedItem && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{selectedItem.id}</Descriptions.Item>
              <Descriptions.Item label="SKU编码">{selectedItem.sku}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{selectedItem.name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={typeMap[selectedItem.type]?.color}>
                  {typeMap[selectedItem.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="单位">{selectedItem.unit}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedItem.status]?.color}>
                  {statusMap[selectedItem.status]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="库存信息" bordered column={2}>
              <Descriptions.Item label="当前库存">{selectedItem.currentStock} {selectedItem.unit}</Descriptions.Item>
              <Descriptions.Item label="最低库存">{selectedItem.minStock} {selectedItem.unit}</Descriptions.Item>
              <Descriptions.Item label="最高库存">{selectedItem.maxStock ? `${selectedItem.maxStock} ${selectedItem.unit}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="库存位置">{selectedItem.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="最后盘点时间">
                {selectedItem.lastStocktakingAt ? dayjs(selectedItem.lastStocktakingAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属网点">{selectedItem.branchId || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="价值信息" bordered column={2}>
              <Descriptions.Item label="单价">{selectedItem.unitPrice ? `¥${selectedItem.unitPrice}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="总价值">{selectedItem.totalValue ? `¥${selectedItem.totalValue}` : '-'}</Descriptions.Item>
            </Descriptions>

            {selectedItem.description && (
              <>
                <Divider />
                <Descriptions title="备注信息" bordered column={1}>
                  <Descriptions.Item label="描述">{selectedItem.description}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增物料' : '编辑物料'}
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
            name="sku"
            label="SKU编码"
            rules={[{ required: true, message: '请输入SKU编码' }]}
          >
            <Input placeholder="请输入SKU编码" />
          </Form.Item>

          <Form.Item
            name="name"
            label="物料名称"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="物料类型"
            rules={[{ required: true, message: '请选择物料类型' }]}
          >
            <Select placeholder="请选择物料类型">
              {Object.entries(typeMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unit"
            label="计量单位"
            rules={[{ required: true, message: '请输入计量单位' }]}
          >
            <Input placeholder="请输入计量单位，如：个、箱、件" />
          </Form.Item>

          <Form.Item
            name="currentStock"
            label="当前库存"
            rules={[{ required: true, message: '请输入当前库存' }]}
          >
            <InputNumber placeholder="请输入当前库存" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="minStock"
            label="最低库存预警值"
            rules={[{ required: true, message: '请输入最低库存预警值' }]}
          >
            <InputNumber placeholder="请输入最低库存预警值" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="maxStock"
            label="最高库存限制"
          >
            <InputNumber placeholder="请输入最高库存限制（可选）" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="单价（元）"
          >
            <InputNumber placeholder="请输入单价" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="location"
            label="库存位置"
          >
            <Input placeholder="请输入库存位置" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="出入库操作"
        open={stockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        width={500}
        onOk={handleStockSubmit}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={stockForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="currentStock"
            label="当前库存"
          >
            <InputNumber disabled style={{ width: '100%' }} addonAfter={selectedItem?.unit || '个'} />
          </Form.Item>

          <Form.Item
            name="type"
            label="操作类型"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Radio.Group>
              <Radio value="in">入库</Radio>
              <Radio value="out">出库</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber placeholder="请输入数量" style={{ width: '100%' }} min={1} addonAfter={selectedItem?.unit || '个'} />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryList;
