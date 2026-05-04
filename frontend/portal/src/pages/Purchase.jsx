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
  Steps,
  Descriptions,
} from 'antd';
import { PlusOutlined, ShoppingCartOutlined, UserOutlined, MoneyCollectOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

const Purchase = () => {
  const [purchases, setPurchases] = useState([
    { id: '1', code: 'PO-2024-001', name: '办公电脑采购', type: 'IT设备', supplier: '科技有限公司', applicant: '张三', department: '技术部', totalAmount: 120000, status: 'approved', createdAt: '2024-01-10', items: [{ name: '联想笔记本电脑', quantity: 10, price: 12000, total: 120000 }] },
    { id: '2', code: 'PO-2024-002', name: '办公家具采购', type: '办公家具', supplier: '家具有限公司', applicant: '李四', department: '行政部', totalAmount: 85000, status: 'pending', createdAt: '2024-01-15', items: [{ name: '办公桌', quantity: 20, price: 3000, total: 60000 }, { name: '办公椅', quantity: 20, price: 1250, total: 25000 }] },
    { id: '3', code: 'PO-2024-003', name: '打印设备采购', type: '办公设备', supplier: '设备供应商', applicant: '王五', department: '行政部', totalAmount: 25000, status: 'rejected', createdAt: '2024-01-08', items: [{ name: '彩色打印机', quantity: 2, price: 12500, total: 25000 }] },
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: '1', name: '科技有限公司', contact: '张经理', phone: '13800138001', email: 'contact@tech.com', category: 'IT设备', status: 'active', rating: 4.8 },
    { id: '2', name: '家具有限公司', contact: '李经理', phone: '13800138002', email: 'contact@furniture.com', category: '办公家具', status: 'active', rating: 4.5 },
    { id: '3', name: '设备供应商', contact: '王经理', phone: '13800138003', email: 'contact@equip.com', category: '办公设备', status: 'active', rating: 4.2 },
  ]);

  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getStatusColor = (status) => {
    const colors = { draft: 'default', pending: 'orange', approved: 'green', rejected: 'red', completed: 'blue' };
    const texts = { draft: '草稿', pending: '待审批', approved: '已批准', rejected: '已拒绝', completed: '已完成' };
    return { color: colors[status], text: texts[status] };
  };

  const purchaseColumns = [
    { title: '采购单号', dataIndex: 'code', key: 'code' },
    { title: '采购名称', dataIndex: 'name', key: 'name' },
    { title: '采购类型', dataIndex: 'type', key: 'type' },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '所属部门', dataIndex: 'department', key: 'department' },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{val.toLocaleString()}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = getStatusColor(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small">审批</Button>
            </>
          )}
          {record.status === 'draft' && (
            <Button type="link" size="small">提交</Button>
          )}
        </Space>
      ),
    },
  ];

  const supplierColumns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '类别', dataIndex: 'category', key: 'category' },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <span style={{ color: '#faad14' }}>★ {rating}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '合作中' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>采购管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="采购申请总数"
              value={25}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月采购金额"
              value={230000}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审批"
              value={5}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="供应商数量"
              value={12}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="purchases">
        <TabPane tab="采购申请" key="purchases">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setPurchaseModalVisible(true)}>
                新建采购申请
              </Button>
            }
          >
            <Table
              columns={purchaseColumns}
              dataSource={purchases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="供应商管理" key="suppliers">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增供应商
              </Button>
            }
          >
            <Table
              columns={supplierColumns}
              dataSource={suppliers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新建采购申请"
        open={purchaseModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newPurchase = {
              ...values,
              id: Date.now().toString(),
              code: `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`,
              status: 'draft',
              createdAt: new Date().toISOString().split('T')[0],
            };
            setPurchases([newPurchase, ...purchases]);
            message.success('采购申请创建成功');
            setPurchaseModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setPurchaseModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="采购名称"
            rules={[{ required: true, message: '请输入采购名称' }]}
          >
            <Input placeholder="请输入采购名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="采购类型"
                rules={[{ required: true, message: '请选择采购类型' }]}
              >
                <Select placeholder="请选择采购类型">
                  <Option value="IT设备">IT设备</Option>
                  <Option value="办公设备">办公设备</Option>
                  <Option value="办公家具">办公家具</Option>
                  <Option value="办公用品">办公用品</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  {suppliers.map((s) => (
                    <Option key={s.id} value={s.name}>{s.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="所属部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="技术部">技术部</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="人事部">人事部</Option>
                  <Option value="财务部">财务部</Option>
                  <Option value="行政部">行政部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="totalAmount"
            label="预估总金额"
            rules={[{ required: true, message: '请输入预估总金额' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入预估总金额" min={0} />
          </Form.Item>
          <Form.Item name="remark" label="采购说明">
            <TextArea rows={4} placeholder="请输入采购说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Purchase;
