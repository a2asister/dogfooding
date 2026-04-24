import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Statistic,
  Table,
  Tag,
  Button,
  message,
  Tabs,
  Radio,
  Space,
} from 'antd';
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Transaction, Category } from '../types';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff6b81'];

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; categoryId: string }[]>([]);
  const [trendData, setTrendData] = useState<{ name: string; income: number; expense: number }[]>([]);
  const [detailedData, setDetailedData] = useState<{ category: string; count: number; amount: number; percentage: number }[]>([]);

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      const allTransactions = storage.getTransactions();
      const filteredTransactions = allTransactions.filter((t) => {
        if (isAdmin) return true;
        return t.isPublic || t.createdBy === currentUser?.id;
      });
      setTransactions(filteredTransactions);
      setCategories(storage.getCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateReport();
  }, [transactions, timeRange, customDateRange, activeTab]);

  const getDateRange = (): [Date, Date] => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (timeRange === 'custom' && customDateRange) {
      return [customDateRange[0].toDate(), customDateRange[1].toDate()];
    }

    switch (timeRange) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return [start, end];
  };

  const calculateReport = () => {
    const [startDate, endDate] = getDateRange();
    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: filtered.length,
    });

    const targetTransactions = filtered.filter((t) => t.type === activeTab);
    const categoryMap = new Map<string, { name: string; value: number; count: number; categoryId: string }>();

    targetTransactions.forEach((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const name = category?.name || '未分类';
      const existing = categoryMap.get(t.categoryId) || { name, value: 0, count: 0, categoryId: t.categoryId };
      categoryMap.set(t.categoryId, {
        ...existing,
        value: existing.value + t.amount,
        count: existing.count + 1,
      });
    });

    const categoryList = Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value);

    setCategoryData(categoryList.map((c) => ({ name: c.name, value: c.value, categoryId: c.categoryId })));

    const totalAmount = categoryList.reduce((sum, c) => sum + c.value, 0);
    setDetailedData(
      categoryList.map((c) => ({
        category: c.name,
        count: c.count,
        amount: c.value,
        percentage: totalAmount > 0 ? (c.value / totalAmount) * 100 : 0,
      }))
    );

    const trendList: { name: string; income: number; expense: number }[] = [];
    const days = Math.min(30, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTrans = filtered.filter((t) => t.date === dateStr);
      trendList.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        income: dayTrans.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: dayTrans.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      });
    }
    setTrendData(trendList);
  };

  const handleExport = () => {
    const data = {
      period: timeRange,
      customRange: customDateRange?.map((d) => d.format('YYYY-MM-DD')),
      statistics: stats,
      categoryBreakdown: detailedData,
      transactions: transactions.filter((t) => {
        const [startDate, endDate] = getDateRange();
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      }),
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('报表导出成功');
  };

  const columns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '交易笔数',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: activeTab === 'income' ? '#52c41a' : '#ff4d4f' }}>
          ¥{value.toFixed(2)}
        </span>
      ),
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 120,
      render: (value: number) => (
        <Tag color={value >= 30 ? 'red' : value >= 15 ? 'orange' : 'blue'}>
          {value.toFixed(1)}%
        </Tag>
      ),
    },
  ];

  return (
    <div className="reports-page">
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="day">今日</Radio.Button>
            <Radio.Button value="week">本周</Radio.Button>
            <Radio.Button value="month">本月</Radio.Button>
            <Radio.Button value="year">本年</Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
          </Radio.Group>
          {timeRange === 'custom' && (
            <RangePicker
              onChange={(dates) =>
                setCustomDateRange(dates ? [dates[0]!, dates[1]!] : null)
              }
            />
          )}
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            导出报表
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalIncome}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.totalExpense}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="收支结余"
              value={stats.balance}
              precision={2}
              valueStyle={{ color: stats.balance >= 0 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="交易笔数"
              value={stats.transactionCount}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="收支趋势"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `¥${Number(value).toFixed(2)}`} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} name="收入" />
                <Area type="monotone" dataKey="expense" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.3} name="支出" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'income' | 'expense')} size="small">
                <TabPane tab="支出分类" key="expense" />
                <TabPane tab="收入分类" key="income" />
              </Tabs>
            }
            loading={loading}
          >
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `¥${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 100, color: '#8c8c8c' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={`${activeTab === 'expense' ? '支出' : '收入'}明细`}
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={detailedData}
          rowKey="category"
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {detailedData.reduce((sum, d) => sum + d.count, 0)} 笔
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <span style={{ fontWeight: 'bold' }}>
                    ¥{detailedData.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>100.0%</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default Reports;
