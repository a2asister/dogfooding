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
  Descriptions,
  Steps,
} from 'antd';
import { PlusOutlined, FileTextOutlined, UserOutlined, MoneyCollectOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

const Contract = () => {
  const [contracts, setContracts] = useState([
    { id: '1', name: '软件开发服务合同', code: 'CON-2024-001', vendor: '科技有限公司', type: '服务合同', startDate: '2024-01-01', endDate: '2024-12-31', amount: 500000, status: 'active', paid: 250000, approver: '张三' },
    { id: '2', name: '办公设备采购合同', code: 'CON-2024-002', vendor: '设备供应商', type: '采购合同', startDate: '2024-02-01', endDate: '2024-02-28', amount: 150000, status: 'completed', paid: 150000, approver: '李四' },
    { id: '3', name: '场地租赁合同', code: 'CON-2024-003', vendor: '物业有限公司', type: '租赁合同', startDate: '2024-03-01', endDate: '2025-02-28', amount: 720000, status: 'pending', paid: 0, approver: '' },
  ]);

  const [vendors, setVendors] = useState([
    { id: '1', name: '科技有限公司', contact: '张经理', phone: '13800138001', email: 'contact@tech.com', status: 'active', category: 'IT服务' },
    { id: '2', name: '设备供应商', contact: '李经理', phone: '13800138002', email: 'contact@equip.com', status: 'active', category: '设备供应' },
    { id: '3', name: '物业有限公司', contact: '王经理', phone: '13800138003', email: 'contact@property.com', status: 'active', category: '物业服务' },
  ]);

  const [payments, setPayments] = useState([
    { id: '1', contractName: '软件开发服务合同', amount: 250000, date: '2024-01-15', status: 'paid', method: '银行转账', remark: '首付款50%' },
    { id: '2', contractName: '办公设备采购合同', amount: 150000, date: '2024-02-20', status: 'paid', method: '银行转账', remark: '全款支付' },
  ]);

  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getStatusColor = (status) => {
    const colors = { active: 'green', completed: 'blue', pending: 'orange', terminated: 'red' };
    const texts = { active: '执行中', completed: '已完成', pending: '待审批', terminated: '已终止' };
    return { color: colors[status], text: texts[status] };
  };

  const contractColumns = [
    { title: '合同名称', dataIndex: 'name', key: 'name' },
    { title: '合同编号', dataIndex: 'code', key: 'code' },
    { title: '合同类型', dataIndex: 'type', key: 'type' },
    { title: '供应商', dataIndex: 'vendor', key: 'vendor' },
    {
      title: '合同金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => `¥${val.toLocaleString()}`,
    },
    {
      title: '执行周期',
      key: 'period',
      render: (_, record) => `${record.startDate} ~ ${record.endDate}`,
    },
    {
      title: '支付进度',
      key: 'payment',
      render: (_, record) => (
        <div>
          <span>¥{record.paid.toLocaleString()} / ¥{record.amount.toLocaleString()}</span>
          <div style={{ fontSize: 12, color: '#999' }}>
            已付: {Math.round((record.paid / record.amount) * 100)}%
          </div>
        </div>
      ),
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
      render: () => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">支付</Button>
        </Space>
      ),
    },
  ];

  const vendorColumns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '类别', dataIndex: 'category', key: 'category' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '合作中' : '已终止'}
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

  const paymentColumns = [
    { title: '关联合同', dataIndex: 'contractName', key: 'contractName' },
    {
      title: '支付金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <span style={{ color: '#ff4d4f' }}>¥{val.toLocaleString()}</span>,
    },
    { title: '支付日期', dataIndex: 'date', key: 'date' },
    { title: '支付方式', dataIndex: 'method', key: 'method' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? '已支付' : '待支付'}
        </Tag>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>合同管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="合同总数"
              value={25}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="执行中"
              value={12}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="合同总额"
              value={3500000}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审批"
              value={3}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="contracts">
        <TabPane tab="合同列表" key="contracts">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setContractModalVisible(true)}>
                新建合同
              </Button>
            }
          >
            <Table
              columns={contractColumns}
              dataSource={contracts}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="供应商管理" key="vendors">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增供应商
              </Button>
            }
          >
            <Table
              columns={vendorColumns}
              dataSource={vendors}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="支付记录" key="payments">
          <Card>
            <Table
              columns={paymentColumns}
              dataSource={payments}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新建合同"
        open={contractModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newContract = {
              ...values,
              id: Date.now().toString(),
              code: `CON-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
              startDate: values.startDate?.format('YYYY-MM-DD'),
              endDate: values.endDate?.format('YYYY-MM-DD'),
              paid: 0,
              status: 'pending',
            };
            setContracts([...contracts, newContract]);
            message.success('创建成功');
            setContractModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setContractModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="合同名称"
            rules={[{ required: true, message: '请输入合同名称' }]}
          >
            <Input placeholder="请输入合同名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="合同类型"
                rules={[{ required: true, message: '请选择合同类型' }]}
              >
                <Select placeholder="请选择合同类型">
                  <Option value="服务合同">服务合同</Option>
                  <Option value="采购合同">采购合同</Option>
                  <Option value="租赁合同">租赁合同</Option>
                  <Option value="销售合同">销售合同</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vendor"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  {vendors.map((v) => (
                    <Option key={v.id} value={v.name}>{v.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="amount"
            label="合同金额"
            rules={[{ required: true, message: '请输入合同金额' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入合同金额" min={0} />
          </Form.Item>
          <Form.Item name="remark" label="合同摘要">
            <TextArea rows={3} placeholder="请输入合同摘要" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Contract;
