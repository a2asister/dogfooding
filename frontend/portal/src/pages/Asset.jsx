import React, { useState } from 'react';
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Tag,
  message,
  Space,
  Badge,
} from 'antd';
import { PlusOutlined, StockOutlined, ToolOutlined, HistoryOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

const Asset = () => {
  const [assets, setAssets] = useState([
    { id: '1', name: '联想笔记本电脑', code: 'ASS-2024-001', category: '电子设备', purchaseDate: '2023-06-15', price: 6500, status: 'inUse', user: '张三', location: '技术部' },
    { id: '2', name: '惠普台式机', code: 'ASS-2024-002', category: '电子设备', purchaseDate: '2023-08-20', price: 5200, status: 'inUse', user: '李四', location: '市场部' },
    { id: '3', name: '佳能打印机', code: 'ASS-2024-003', category: '办公设备', purchaseDate: '2023-10-10', price: 3800, status: 'maintenance', user: '-', location: '行政部' },
    { id: '4', name: '会议桌', code: 'ASS-2024-004', category: '办公家具', purchaseDate: '2023-05-01', price: 8500, status: 'inUse', user: '-', location: '大会议室' },
  ]);

  const [inventories, setInventories] = useState([
    { id: '1', name: 'A4打印纸', sku: 'SKU-001', category: '办公用品', quantity: 50, unit: '包', minStock: 20, location: '仓库A' },
    { id: '2', name: '黑色签字笔', sku: 'SKU-002', category: '办公用品', quantity: 200, unit: '支', minStock: 100, location: '仓库A' },
    { id: '3', name: '墨盒', sku: 'SKU-003', category: '办公耗材', quantity: 8, unit: '个', minStock: 10, location: '仓库B' },
  ]);

  const [maintenances, setMaintenances] = useState([
    { id: '1', assetName: '佳能打印机', type: '定期保养', date: '2024-01-15', cost: 800, status: 'completed', operator: '王五' },
    { id: '2', assetName: '联想笔记本电脑', type: '故障维修', date: '2024-01-10', cost: 300, status: 'inProgress', operator: '赵六' },
  ]);

  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [form] = Form.useForm();

  const assetColumns = [
    { title: '资产名称', dataIndex: 'name', key: 'name' },
    { title: '资产编号', dataIndex: 'code', key: 'code' },
    { title: '资产类别', dataIndex: 'category', key: 'category' },
    {
      title: '价值',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `¥${val.toLocaleString()}`,
    },
    { title: '使用人', dataIndex: 'user', key: 'user' },
    { title: '存放位置', dataIndex: 'location', key: 'location' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = { inUse: 'green', idle: 'blue', maintenance: 'orange', scrap: 'red' };
        const textMap = { inUse: '使用中', idle: '闲置', maintenance: '维护中', scrap: '已报废' };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">调拨</Button>
          <Button type="link" size="small" danger>报废</Button>
        </Space>
      ),
    },
  ];

  const inventoryColumns = [
    { title: '物品名称', dataIndex: 'name', key: 'name' },
    { title: 'SKU编码', dataIndex: 'sku', key: 'sku' },
    { title: '类别', dataIndex: 'category', key: 'category' },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val, record) => (
        <Space>
          <span>{val} {record.unit}</span>
          {val < record.minStock && <Badge status="error" text="库存不足" />}
        </Space>
      ),
    },
    { title: '存放位置', dataIndex: 'location', key: 'location' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" size="small">入库</Button>
          <Button type="link" size="small">出库</Button>
        </Space>
      ),
    },
  ];

  const maintenanceColumns = [
    { title: '资产名称', dataIndex: 'assetName', key: 'assetName' },
    { title: '维护类型', dataIndex: 'type', key: 'type' },
    { title: '维护日期', dataIndex: 'date', key: 'date' },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (val) => `¥${val}`,
    },
    { title: '操作人', dataIndex: 'operator', key: 'operator' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? '已完成' : '进行中'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>资产管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="资产总数"
              value={156}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在用资产"
              value={128}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="维护中"
              value={5}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="资产总值"
              value={856000}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="assets">
        <TabPane tab="固定资产" key="assets">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAssetModalVisible(true)}>
                新增资产
              </Button>
            }
          >
            <Table
              columns={assetColumns}
              dataSource={assets}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="库存管理" key="inventories">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增物品
              </Button>
            }
          >
            <Table
              columns={inventoryColumns}
              dataSource={inventories}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="维护记录" key="maintenances">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增维护
              </Button>
            }
          >
            <Table
              columns={maintenanceColumns}
              dataSource={maintenances}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新增资产"
        open={assetModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newAsset = {
              ...values,
              id: Date.now().toString(),
              code: `ASS-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, '0')}`,
              purchaseDate: values.purchaseDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
              status: 'idle',
            };
            setAssets([...assets, newAsset]);
            message.success('添加成功');
            setAssetModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setAssetModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="资产名称"
            rules={[{ required: true, message: '请输入资产名称' }]}
          >
            <Input placeholder="请输入资产名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="资产类别"
                rules={[{ required: true, message: '请选择资产类别' }]}
              >
                <Select placeholder="请选择资产类别">
                  <Option value="电子设备">电子设备</Option>
                  <Option value="办公设备">办公设备</Option>
                  <Option value="办公家具">办公家具</Option>
                  <Option value="交通工具">交通工具</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="购买价格"
                rules={[{ required: true, message: '请输入购买价格' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入购买价格" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="购买日期"
                rules={[{ required: true, message: '请选择购买日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="存放位置">
                <Input placeholder="请输入存放位置" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Asset;
