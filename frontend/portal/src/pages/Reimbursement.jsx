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
  Divider,
  List,
  Upload,
} from 'antd';
import { PlusOutlined, ReconciliationOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

const Reimbursement = () => {
  const [reimbursements, setReimbursements] = useState([
    { id: '1', code: 'RB-2024-001', applicant: '张三', department: '技术部', type: '差旅费', totalAmount: 3500, status: 'approved', createdAt: '2024-01-10', items: [{ category: '机票', amount: 2000, date: '2024-01-05', description: '北京-上海往返机票' }, { category: '住宿费', amount: 1500, date: '2024-01-06', description: '上海酒店住宿' }], approvalFlow: [{ step: '提交申请', status: 'completed', operator: '张三', time: '2024-01-10 10:00' }, { step: '部门审批', status: 'completed', operator: '部门经理', time: '2024-01-10 14:00' }, { step: '财务审批', status: 'completed', operator: '财务主管', time: '2024-01-11 09:00' }, { step: '打款', status: 'completed', operator: '出纳', time: '2024-01-11 15:00' }] },
    { id: '2', code: 'RB-2024-002', applicant: '李四', department: '市场部', type: '招待费', totalAmount: 2800, status: 'pending', createdAt: '2024-01-15', items: [{ category: '餐饮费', amount: 2800, date: '2024-01-12', description: '客户招待晚餐' }], approvalFlow: [{ step: '提交申请', status: 'completed', operator: '李四', time: '2024-01-15 09:00' }, { step: '部门审批', status: 'inProgress', operator: '-', time: '-' }, { step: '财务审批', status: 'pending', operator: '-', time: '-' }, { step: '打款', status: 'pending', operator: '-', time: '-' }] },
    { id: '3', code: 'RB-2024-003', applicant: '王五', department: '行政部', type: '办公用品', totalAmount: 1200, status: 'rejected', createdAt: '2024-01-08', items: [{ category: '打印纸', amount: 600, date: '2024-01-05', description: 'A4打印纸20包' }, { category: '墨盒', amount: 600, date: '2024-01-06', description: '打印机墨盒6个' }], approvalFlow: [{ step: '提交申请', status: 'completed', operator: '王五', time: '2024-01-08 11:00' }, { step: '部门审批', status: 'completed', operator: '部门经理', time: '2024-01-08 15:00' }, { step: '财务审批', status: 'rejected', operator: '财务主管', time: '2024-01-09 09:00' }, { step: '打款', status: 'rejected', operator: '-', time: '-' }] },
  ]);

  const [expenseItems, setExpenseItems] = useState([
    { id: '1', reimbursementCode: 'RB-2024-001', category: '机票', amount: 2000, date: '2024-01-05', description: '北京-上海往返机票' },
    { id: '2', reimbursementCode: 'RB-2024-001', category: '住宿费', amount: 1500, date: '2024-01-06', description: '上海酒店住宿' },
    { id: '3', reimbursementCode: 'RB-2024-002', category: '餐饮费', amount: 2800, date: '2024-01-12', description: '客户招待晚餐' },
  ]);

  const [reimbursementModalVisible, setReimbursementModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getStatusColor = (status) => {
    const colors = { draft: 'default', pending: 'orange', approved: 'green', rejected: 'red', paid: 'blue' };
    const texts = { draft: '草稿', pending: '审批中', approved: '已批准', rejected: '已拒绝', paid: '已打款' };
    return { color: colors[status], text: texts[status] };
  };

  const reimbursementColumns = [
    { title: '报销单号', dataIndex: 'code', key: 'code' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '所属部门', dataIndex: 'department', key: 'department' },
    { title: '报销类型', dataIndex: 'type', key: 'type' },
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
            <Button type="link" size="small">审批</Button>
          )}
          {record.status === 'draft' && (
            <>
              <Button type="link" size="small">编辑</Button>
              <Button type="link" size="small">提交</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const expenseItemColumns = [
    { title: '关联报销单', dataIndex: 'reimbursementCode', key: 'reimbursementCode' },
    { title: '费用类别', dataIndex: 'category', key: 'category' },
    { title: '费用金额', dataIndex: 'amount', key: 'amount', render: (val) => <span style={{ color: '#ff4d4f' }}>¥{val.toLocaleString()}</span> },
    { title: '发生日期', dataIndex: 'date', key: 'date' },
    { title: '描述', dataIndex: 'description', key: 'description' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>报销管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="报销申请总数"
              value={35}
              prefix={<ReconciliationOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月报销金额"
              value={75000}
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
              value={8}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待打款"
              value={5}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="reimbursements">
        <TabPane tab="报销申请" key="reimbursements">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setReimbursementModalVisible(true)}>
                新建报销申请
              </Button>
            }
          >
            <Table
              columns={reimbursementColumns}
              dataSource={reimbursements}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="费用明细" key="expenseItems">
          <Card>
            <Table
              columns={expenseItemColumns}
              dataSource={expenseItems}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新建报销申请"
        open={reimbursementModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newReimbursement = {
              ...values,
              id: Date.now().toString(),
              code: `RB-${new Date().getFullYear()}-${String(reimbursements.length + 1).padStart(3, '0')}`,
              status: 'draft',
              createdAt: new Date().toISOString().split('T')[0],
            };
            setReimbursements([newReimbursement, ...reimbursements]);
            message.success('报销申请创建成功');
            setReimbursementModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setReimbursementModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
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
            name="type"
            label="报销类型"
            rules={[{ required: true, message: '请选择报销类型' }]}
          >
            <Select placeholder="请选择报销类型">
              <Option value="差旅费">差旅费</Option>
              <Option value="招待费">招待费</Option>
              <Option value="办公费">办公费</Option>
              <Option value="通讯费">通讯费</Option>
              <Option value="交通费">交通费</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="totalAmount"
            label="报销总金额"
            rules={[{ required: true, message: '请输入报销总金额' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入报销总金额" min={0} />
          </Form.Item>
          <Form.Item
            name="expenseDate"
            label="费用发生日期"
            rules={[{ required: true, message: '请选择费用发生日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="上传发票/凭证">
            <Upload
              listType="picture"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="remark" label="报销说明">
            <TextArea rows={4} placeholder="请输入报销说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Reimbursement;
