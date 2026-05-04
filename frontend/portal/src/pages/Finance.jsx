import React, { useState, useEffect } from 'react';
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
  InputNumber,
  Select,
  DatePicker,
  Tag,
  message,
  Space,
  Spin,
  Empty,
} from 'antd';
import { PlusOutlined, MoneyCollectOutlined, RiseOutlined, FallOutlined, LoadingOutlined } from '@ant-design/icons';
import financeService from '../services/financeService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

const Finance = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await financeService.getBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error('获取预算列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await financeService.getExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error('获取支出列表失败:', error);
    }
  };

  const fetchIncomes = async () => {
    try {
      const data = await financeService.getIncomes();
      setIncomes(data || []);
    } catch (error) {
      console.error('获取收入列表失败:', error);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
    fetchIncomes();
  }, []);

  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingCount = expenses.filter(item => item.status === 'pending').length;

  const budgetColumns = [
    { title: '部门', dataIndex: 'department', key: 'department' },
    {
      title: '预算金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => `¥${val?.toLocaleString() || 0}`,
    },
    {
      title: '已使用',
      dataIndex: 'used',
      key: 'used',
      render: (val, record) => (
        <div>
          <span>¥{val?.toLocaleString() || 0}</span>
          <div style={{ fontSize: 12, color: '#999' }}>
            使用率: {record.amount ? Math.round((val / record.amount) * 100) : 0}%
          </div>
        </div>
      ),
    },
    { title: '预算周期', dataIndex: 'period', key: 'period' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '生效中' : '已结束'}
        </Tag>
      ),
    },
  ];

  const expenseColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '费用类别', dataIndex: 'category', key: 'category' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <span style={{ color: '#ff4d4f' }}>¥{val?.toLocaleString() || 0}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = { approved: 'green', pending: 'orange', rejected: 'red' };
        const textMap = { approved: '已审批', pending: '待审批', rejected: '已拒绝' };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
      },
    },
  ];

  const incomeColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '收入来源', dataIndex: 'source', key: 'source' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <span style={{ color: '#52c41a' }}>¥{val?.toLocaleString() || 0}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'received' ? 'green' : 'orange'}>
          {status === 'received' ? '已到账' : '待确认'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>财务管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月总收入"
              value={totalIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
              suffix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月总支出"
              value={totalExpense}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
              suffix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月净利润"
              value={totalIncome - totalExpense}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审批单据"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="budgets">
        <TabPane tab="预算管理" key="budgets">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setBudgetModalVisible(true)}>
                新增预算
              </Button>
            }
          >
            <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
              {!loading && budgets.length === 0 ? (
                <Empty description="暂无预算数据" />
              ) : (
                <Table
                  columns={budgetColumns}
                  dataSource={budgets}
                  rowKey="id"
                  pagination={false}
                />
              )}
            </Spin>
          </Card>
        </TabPane>
        
        <TabPane tab="支出管理" key="expenses">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setExpenseModalVisible(true)}>
                新增支出
              </Button>
            }
          >
            {expenses.length === 0 ? (
              <Empty description="暂无支出数据" />
            ) : (
              <Table
                columns={expenseColumns}
                dataSource={expenses}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="收入管理" key="incomes">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增收入
              </Button>
            }
          >
            {incomes.length === 0 ? (
              <Empty description="暂无收入数据" />
            ) : (
              <Table
                columns={incomeColumns}
                dataSource={incomes}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新增预算"
        open={budgetModalVisible}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            await financeService.createBudget({
              ...values,
              used: 0,
              status: 'active',
            });
            message.success('添加成功');
            setBudgetModalVisible(false);
            form.resetFields();
            fetchBudgets();
          } catch (error) {
            console.error('添加预算失败:', error);
          }
        }}
        onCancel={() => setBudgetModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="department"
            label="部门"
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
          <Form.Item
            name="amount"
            label="预算金额"
            rules={[{ required: true, message: '请输入预算金额' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入预算金额" min={0} />
          </Form.Item>
          <Form.Item
            name="period"
            label="预算周期"
            rules={[{ required: true, message: '请选择预算周期' }]}
          >
            <Select placeholder="请选择预算周期">
              <Option value="2024年Q1">2024年Q1</Option>
              <Option value="2024年Q2">2024年Q2</Option>
              <Option value="2024年Q3">2024年Q3</Option>
              <Option value="2024年Q4">2024年Q4</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增支出"
        open={expenseModalVisible}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            await financeService.createExpense({
              ...values,
              date: values.date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
              status: 'pending',
            });
            message.success('添加成功');
            setExpenseModalVisible(false);
            form.resetFields();
            fetchExpenses();
          } catch (error) {
            console.error('添加支出失败:', error);
          }
        }}
        onCancel={() => setExpenseModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="费用类别"
            rules={[{ required: true, message: '请选择费用类别' }]}
          >
            <Select placeholder="请选择费用类别">
              <Option value="办公用品">办公用品</Option>
              <Option value="差旅费">差旅费</Option>
              <Option value="招待费">招待费</Option>
              <Option value="通讯费">通讯费</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入金额" min={0} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Finance;
