import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Table, Tag, Statistic } from 'antd';
import { RiseOutlined, FallOutlined, WalletOutlined, ReconciliationOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { transactionApi, cardApi, tagApi } from '../api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Statistics = () => {
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    income_count: 0,
    expense_count: 0
  });
  const [cardStats, setCardStats] = useState([]);
  const [tagStats, setTagStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    card_id: null,
    start_date: dayjs().startOf('month'),
    end_date: dayjs().endOf('month')
  });

  useEffect(() => {
    fetchCards();
    fetchTags();
    fetchStats();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await cardApi.getAll();
      setCards(response.data);
    } catch (error) {
      console.error('获取银行卡失败:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagApi.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  const fetchStats = async (newFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (newFilters.card_id) params.card_id = newFilters.card_id;
      if (newFilters.start_date) params.start_date = newFilters.start_date.format('YYYY-MM-DD');
      if (newFilters.end_date) params.end_date = newFilters.end_date.format('YYYY-MM-DD');

      const response = await transactionApi.getStats(params);
      setStats(response.data);

      fetchCardStats(params);
      fetchTagStats(params);
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardStats = async (params) => {
    try {
      const transactionsResponse = await transactionApi.getAll({
        ...params,
        limit: 1000
      });

      const transactions = transactionsResponse.data.transactions;
      const cardMap = {};

      transactions.forEach(t => {
        if (!cardMap[t.card_id]) {
          cardMap[t.card_id] = {
            id: t.card_id,
            bank_name: t.bank_name,
            card_number_last4: t.card_number_last4,
            income: 0,
            expense: 0,
            income_count: 0,
            expense_count: 0
          };
        }

        if (t.transaction_type === 'income') {
          cardMap[t.card_id].income += t.amount;
          cardMap[t.card_id].income_count += 1;
        } else {
          cardMap[t.card_id].expense += t.amount;
          cardMap[t.card_id].expense_count += 1;
        }
      });

      setCardStats(Object.values(cardMap));
    } catch (error) {
      console.error('获取卡片统计失败:', error);
    }
  };

  const fetchTagStats = async (params) => {
    try {
      const transactionsResponse = await transactionApi.getAll({
        ...params,
        limit: 1000
      });

      const transactions = transactionsResponse.data.transactions;
      const tagMap = {};

      transactions.forEach(t => {
        if (t.tags && t.tags.length > 0) {
          t.tags.forEach(tag => {
            if (!tagMap[tag.id]) {
              tagMap[tag.id] = {
                id: tag.id,
                name: tag.name,
                color: tag.color,
                income: 0,
                expense: 0,
                count: 0
              };
            }

            if (t.transaction_type === 'income') {
              tagMap[tag.id].income += t.amount;
            } else {
              tagMap[tag.id].expense += t.amount;
            }
            tagMap[tag.id].count += 1;
          });
        }
      });

      setTagStats(Object.values(tagMap));
    } catch (error) {
      console.error('获取标签统计失败:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value || null };
    setFilters(newFilters);
    fetchStats(newFilters);
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const newFilters = {
        ...filters,
        start_date: dates[0],
        end_date: dates[1]
      };
      setFilters(newFilters);
      fetchStats(newFilters);
    }
  };

  const cardColumns = [
    {
      title: '银行卡',
      dataIndex: 'bank_name',
      key: 'bank_name',
      render: (text, record) => (
        <span>
          {text}
          <Tag color="blue" style={{ marginLeft: 8 }}>
            尾号 {record.card_number_last4}
          </Tag>
        </span>
      )
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (value) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          +¥{value.toFixed(2)}
        </span>
      )
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (value) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          -¥{value.toFixed(2)}
        </span>
      )
    },
    {
      title: '净余额',
      key: 'balance',
      render: (_, record) => {
        const balance = record.income - record.expense;
        return (
          <span style={{ 
            color: balance >= 0 ? '#1890ff' : '#ff4d4f',
            fontWeight: 'bold' 
          }}>
            {balance >= 0 ? '+' : ''}¥{balance.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: '交易笔数',
      key: 'count',
      render: (_, record) => (
        <span>{record.income_count + record.expense_count} 笔</span>
      )
    }
  ];

  const tagColumns = [
    {
      title: '标签',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Tag color={record.color}>{name}</Tag>
      )
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (value) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          +¥{value.toFixed(2)}
        </span>
      )
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (value) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          -¥{value.toFixed(2)}
        </span>
      )
    },
    {
      title: '交易笔数',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <span>{count} 笔</span>
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Select
          placeholder="选择银行卡（可选）"
          allowClear
          style={{ width: 250 }}
          value={filters.card_id}
          onChange={(value) => handleFilterChange('card_id', value)}
        >
          {cards.map(card => (
            <Option key={card.id} value={card.id}>
              {card.bank_name} (尾号 {card.card_number_last4})
            </Option>
          ))}
        </Select>
        <RangePicker
          value={[filters.start_date, filters.end_date]}
          onChange={handleDateRangeChange}
          style={{ width: 300 }}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.total_income}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.total_expense}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<FallOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净余额"
              value={stats.balance}
              precision={2}
              valueStyle={{ color: stats.balance >= 0 ? '#1890ff' : '#ff4d4f' }}
              prefix={<WalletOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交易笔数"
              value={stats.income_count + stats.expense_count}
              prefix={<ReconciliationOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="银行卡统计" style={{ marginBottom: 24 }}>
            <Table
              columns={cardColumns}
              dataSource={cardStats}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="标签统计" style={{ marginBottom: 24 }}>
            <Table
              columns={tagColumns}
              dataSource={tagStats}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
