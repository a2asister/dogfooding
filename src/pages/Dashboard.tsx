import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, List, Tag, Progress, Button, message, Modal } from 'antd';
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Transaction, Budget, Notification } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const { confirm } = Modal;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ name: string; income: number; expense: number }[]>([]);

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
      const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');

      const transactions = storage.getTransactions();
      const filteredTransactions = transactions.filter((t) => {
        if (isAdmin) return true;
        return t.isPublic || t.createdBy === currentUser?.id;
      });

      const todayTrans = filteredTransactions.filter((t) => t.date === today);
      const monthTrans = filteredTransactions.filter(
        (t) => t.date >= monthStart && t.date <= monthEnd
      );

      setTodayIncome(todayTrans.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
      setTodayExpense(todayTrans.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
      setMonthIncome(monthTrans.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
      setMonthExpense(monthTrans.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

      setTotalBalance(storage.getAccountTotalBalance());
      setTotalAssets(storage.getTotalAssets());
      setTotalLiabilities(storage.getTotalLiabilities());
      setNetWorth(storage.getNetWorth());

      setRecentTransactions(filteredTransactions.slice(0, 5));

      const allBudgets = storage.getBudgets();
      const filteredBudgets = allBudgets.filter((b) => {
        if (isAdmin) return true;
        return b.isPublic || b.createdBy === currentUser?.id;
      });
      setBudgets(filteredBudgets);

      const allNotifications = storage.getNotifications().filter((n) => !n.isRead).slice(0, 5);
      setNotifications(allNotifications);

      const categoryMap = new Map<string, number>();
      const categories = storage.getCategories();
      
      monthTrans.filter((t) => t.type === 'expense').forEach((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        const name = category?.name || '其他';
        categoryMap.set(name, (categoryMap.get(name) || 0) + t.amount);
      });

      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
      setExpenseByCategory(categoryData);

      const days = 7;
      const trendList = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day').format('MM-DD');
        const dateFull = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const dayTrans = filteredTransactions.filter((t) => t.date === dateFull);
        trendList.push({
          name: date,
          income: dayTrans.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          expense: dayTrans.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        });
      }
      setTrendData(trendList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markNotificationRead = (id: string) => {
    storage.markNotificationRead(id);
    loadData();
    message.success('已标记为已读');
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
    };
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="账户余额"
              value={totalBalance}
              precision={2}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card income" loading={loading}>
            <Statistic
              title="今日收入"
              value={todayIncome}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              本月收入: ¥{monthIncome.toFixed(2)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card expense" loading={loading}>
            <Statistic
              title="今日支出"
              value={todayExpense}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              本月支出: ¥{monthExpense.toFixed(2)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card net" loading={loading}>
            <Statistic
              title="家庭净资产"
              value={netWorth}
              precision={2}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              资产: ¥{totalAssets.toFixed(2)} | 负债: ¥{totalLiabilities.toFixed(2)}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="近7天收支趋势"
            extra={<Button type="link" onClick={() => {}}>查看更多</Button>}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#52c41a" name="收入" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ff4d4f" name="支出" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="本月支出分类"
            loading={loading}
          >
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 100, color: '#8c8c8c' }}>
                暂无支出数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="最近交易"
            extra={<Button type="link" onClick={() => {}}>查看全部</Button>}
            loading={loading}
          >
            <List
              dataSource={recentTransactions}
              renderItem={(item) => {
                const category = storage.getCategoryById(item.categoryId);
                return (
                  <List.Item className="transaction-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        className="category-icon"
                        style={{
                          background: category?.color ? `${category.color}15` : '#f0f0f0',
                          color: category?.color || '#8c8c8c',
                        }}
                      >
                        {category?.icon || '💰'}
                      </div>
                      <div>
                        <div className="transaction-title">
                          {category?.name || '未分类'}
                          {!item.isPublic && (
                            <Tag color="orange" style={{ marginLeft: 8 }}>私有</Tag>
                          )}
                        </div>
                        <div className="transaction-date">{item.date}</div>
                      </div>
                    </div>
                    <div className={`transaction-amount ${item.type === 'income' ? 'income' : 'expense'}`}>
                      {item.type === 'income' ? '+' : '-'}¥{item.amount.toFixed(2)}
                    </div>
                  </List.Item>
                );
              }}
              locale={{ emptyText: '暂无交易记录' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="预算执行情况"
            extra={<Button type="link" onClick={() => {}}>管理预算</Button>}
            loading={loading}
          >
            {budgets.length > 0 ? (
              <List
                dataSource={budgets}
                renderItem={(item) => {
                  const progress = getBudgetProgress(item);
                  const category = storage.getCategoryById(item.categoryId);
                  const status = progress.percentage >= 100 ? 'exception' : progress.percentage >= item.notificationThreshold ? 'active' : 'normal';
                  
                  return (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>{category?.icon} {item.name}</span>
                          <span style={{ 
                            color: progress.percentage >= 100 ? '#ff4d4f' : progress.percentage >= item.notificationThreshold ? '#faad14' : '#1890ff' 
                          }}>
                            ¥{progress.spent.toFixed(2)} / ¥{item.amount.toFixed(2)}
                          </span>
                        </div>
                        <Progress 
                          percent={progress.percentage} 
                          status={status as any}
                          size="small"
                        />
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                暂无预算计划
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {notifications.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="待办提醒" loading={loading}>
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small" onClick={() => markNotificationRead(item.id)}>
                        标记已读
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          {item.type === 'payment_due' && <Tag color="red">还款提醒</Tag>}
                          {item.type === 'budget_warning' && <Tag color="orange">预算预警</Tag>}
                          {item.type === 'budget_over' && <Tag color="red">预算超支</Tag>}
                          {item.type === 'system' && <Tag color="blue">系统通知</Tag>}
                          <span style={{ marginLeft: 8 }}>{item.title}</span>
                        </span>
                      }
                      description={item.message}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
