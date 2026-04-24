import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Space,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Progress,
  List,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Budget, Category } from '../types';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const periodMap: Record<string, { label: string; color: string }> = {
  monthly: { label: '月度', color: 'blue' },
  quarterly: { label: '季度', color: 'green' },
  yearly: { label: '年度', color: 'purple' },
};

const Budgets: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [form] = Form.useForm();

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      const allBudgets = storage.getBudgets();
      const filteredBudgets = allBudgets.filter((b) => {
        if (isAdmin) return true;
        return b.isPublic || b.createdBy === currentUser?.id;
      });
      setBudgets(filteredBudgets);
      setCategories(storage.getCategoriesByType('expense'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingBudget(null);
    form.resetFields();
    form.setFieldsValue({
      period: 'monthly',
      notificationThreshold: 80,
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Budget) => {
    setEditingBudget(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const budget = storage.getBudgetById(id);
    storage.deleteBudget(id);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '删除',
      module: '预算管理',
      description: `删除了预算: ${budget?.name}`,
      details: { budgetId: id },
    });
    
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    const budgetData = {
      name: values.name,
      categoryId: values.categoryId,
      period: values.period,
      amount: values.amount,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      isPublic: values.isPublic,
      createdBy: currentUser!.id,
      notificationThreshold: values.notificationThreshold,
    };

    if (editingBudget) {
      storage.updateBudget(editingBudget.id, budgetData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '编辑',
        module: '预算管理',
        description: `编辑了预算: ${values.name}`,
        details: { budgetId: editingBudget.id },
      });
      
      message.success('预算更新成功');
    } else {
      storage.addBudget(budgetData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '新增',
        module: '预算管理',
        description: `新增了预算: ${values.name}`,
        details: { name: values.name, amount: values.amount },
      });
      
      message.success('预算添加成功');
    }

    setIsModalOpen(false);
    loadData();
  };

  const getBudgetProgress = (budget: Budget) => {
    const transactions = storage.getTransactions().filter((t) => {
      const matchesCategory = t.categoryId === budget.categoryId;
      const matchesDate = t.date >= budget.startDate && t.date <= budget.endDate;
      const matchesVisibility = isAdmin || t.isPublic || t.createdBy === currentUser?.id;
      return matchesCategory && matchesDate && matchesVisibility && t.type === 'expense';
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.amount) * 100;

    return {
      spent,
      remaining: budget.amount - spent,
      percentage: Math.min(percentage, 100),
      isWarning: percentage >= budget.notificationThreshold,
      isOver: percentage >= 100,
    };
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getBudgetProgress(b).spent, 0);

  const columns = [
    {
      title: '预算名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        return (
          <span>
            {category?.icon} {category?.name || '未分类'}
          </span>
        );
      },
    },
    {
      title: '周期',
      dataIndex: 'period',
      key: 'period',
      width: 80,
      render: (period: string) => {
        const config = periodMap[period];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '预算金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => <span style={{ fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '执行情况',
      key: 'progress',
      width: 200,
      render: (_: unknown, record: Budget) => {
        const progress = getBudgetProgress(record);
        const status = progress.isOver ? 'exception' : progress.isWarning ? 'active' : 'normal';
        
        return (
          <div style={{ minWidth: 150 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: progress.isOver ? '#ff4d4f' : progress.isWarning ? '#faad14' : '#52c41a' }}>
                {progress.isOver && <WarningOutlined style={{ marginRight: 4 }} />}
                ¥{progress.spent.toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                {progress.percentage.toFixed(0)}%
              </span>
            </div>
            <Progress percent={progress.percentage} size="small" status={status as any} />
          </div>
        );
      },
    },
    {
      title: '日期范围',
      key: 'dateRange',
      width: 200,
      render: (_: unknown, record: Budget) => (
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          {record.startDate} ~ {record.endDate}
        </span>
      ),
    },
    {
      title: '可见性',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 80,
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? 'blue' : 'orange'}>
          {isPublic ? '公开' : '私有'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Budget) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个预算吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="budgets-page">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总预算金额"
              value={totalBudget}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已消费金额"
              value={totalSpent}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="预算数量"
              value={budgets.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="预算管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加预算
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={budgets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个预算`,
          }}
        />
      </Card>

      <Modal
        title={editingBudget ? '编辑预算' : '添加预算'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="预算名称" rules={[{ required: true, message: '请输入预算名称' }]}>
            <Input placeholder="例如：餐饮月度预算" />
          </Form.Item>

          <Form.Item name="categoryId" label="支出分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择支出分类">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  <span style={{ color: c.color }}>{c.icon}</span> {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="period" label="预算周期" rules={[{ required: true }]}>
            <Select>
              {Object.entries(periodMap).map(([value, config]) => (
                <Option key={value} value={value}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="amount" label="预算金额" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入预算金额"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item name="dateRange" label="日期范围" rules={[{ required: true, message: '请选择日期范围' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notificationThreshold" label="预警阈值(%)" tooltip="当消费超过此比例时，将发出预警提醒">
            <InputNumber
              min={50}
              max={99}
              style={{ width: '100%' }}
              placeholder="默认 80%"
              suffix="%"
            />
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
                {editingBudget ? '保存修改' : '确认添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Budgets;
