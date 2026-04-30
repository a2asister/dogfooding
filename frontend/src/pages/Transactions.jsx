import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Space,
  Tag,
  Popconfirm,
  Card,
  Row,
  Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { transactionApi, cardApi, tagApi } from '../api';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    card_id: null,
    transaction_type: null,
    start_date: null,
    end_date: null,
    search: null,
    tag_ids: null
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchCards();
    fetchTags();
    fetchStats();
  }, []);

  const fetchData = async (newFilters = filters, newPagination = pagination) => {
    setLoading(true);
    try {
      const params = {
        ...newFilters,
        page: newPagination.current,
        limit: newPagination.pageSize
      };

      if (params.start_date) {
        params.start_date = params.start_date.format('YYYY-MM-DD');
      }
      if (params.end_date) {
        params.end_date = params.end_date.format('YYYY-MM-DD');
      }

      const response = await transactionApi.getAll(params);
      setTransactions(response.data.transactions);
      setPagination({
        ...newPagination,
        total: response.data.pagination.total
      });
    } catch (error) {
      message.error('获取交易记录失败');
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const params = {};
      if (newFilters.card_id) params.card_id = newFilters.card_id;
      if (newFilters.start_date) params.start_date = newFilters.start_date.format('YYYY-MM-DD');
      if (newFilters.end_date) params.end_date = newFilters.end_date.format('YYYY-MM-DD');

      const response = await transactionApi.getStats(params);
      setStats(response.data);
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value || null };
    setFilters(newFilters);
    fetchData(newFilters, { ...pagination, current: 1 });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value || null };
    setFilters(newFilters);
    fetchData(newFilters, { ...pagination, current: 1 });
    if (key === 'card_id' || key === 'start_date' || key === 'end_date') {
      fetchStats(newFilters);
    }
  };

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...filters,
      start_date: dates ? dates[0] : null,
      end_date: dates ? dates[1] : null
    };
    setFilters(newFilters);
    fetchData(newFilters, { ...pagination, current: 1 });
    fetchStats(newFilters);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    form.resetFields();
    form.setFieldsValue({
      transaction_type: 'expense',
      transaction_date: dayjs()
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      transaction_date: dayjs(record.transaction_date),
      tag_ids: record.tags ? record.tags.map(t => t.id) : []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await transactionApi.delete(id);
      message.success('删除成功');
      fetchData();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const formattedValues = {
        ...values,
        transaction_date: values.transaction_date.format('YYYY-MM-DD')
      };

      if (editingTransaction) {
        await transactionApi.update(editingTransaction.id, formattedValues);
        message.success('更新成功');
      } else {
        await transactionApi.create(formattedValues);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchData();
      fetchStats();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleTableChange = (pagination) => {
    const newPagination = { ...pagination };
    setPagination(newPagination);
    fetchData(filters, newPagination);
  };

  const columns = [
    {
      title: '交易日期',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      width: 120
    },
    {
      title: '交易类型',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (type) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
      width: 80
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ 
          color: record.transaction_type === 'income' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {record.transaction_type === 'income' ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      ),
      width: 120
    },
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
      title: '商家',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (text) => text || '-'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space>
          {tags?.map(tag => (
            <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条交易记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总收入</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                +¥{stats.total_income.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总支出</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                -¥{stats.total_expense.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>净余额</div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: stats.balance >= 0 ? '#1890ff' : '#ff4d4f' 
              }}>
                {stats.balance >= 0 ? '+' : ''}¥{stats.balance.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>交易笔数</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {stats.income_count + stats.expense_count}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          <Select
            placeholder="选择银行卡"
            allowClear
            style={{ width: 200 }}
            value={filters.card_id}
            onChange={(value) => handleFilterChange('card_id', value)}
          >
            {cards.map(card => (
              <Option key={card.id} value={card.id}>
                {card.bank_name} (尾号 {card.card_number_last4})
              </Option>
            ))}
          </Select>
          <Select
            placeholder="交易类型"
            allowClear
            style={{ width: 120 }}
            value={filters.transaction_type}
            onChange={(value) => handleFilterChange('transaction_type', value)}
          >
            <Option value="income">收入</Option>
            <Option value="expense">支出</Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            style={{ width: 280 }}
            onChange={handleDateRangeChange}
          />
          <Search
            placeholder="搜索商家或描述..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加交易
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingTransaction ? '编辑交易记录' : '添加交易记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="card_id"
            label="银行卡"
            rules={[{ required: true, message: '请选择银行卡' }]}
          >
            <Select placeholder="请选择银行卡">
              {cards.map(card => (
                <Option key={card.id} value={card.id}>
                  {card.bank_name} (尾号 {card.card_number_last4})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="transaction_type"
            label="交易类型"
            rules={[{ required: true, message: '请选择交易类型' }]}
          >
            <Select placeholder="请选择交易类型">
              <Option value="income">收入</Option>
              <Option value="expense">支出</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              min={0.01}
              precision={2}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="transaction_date"
            label="交易日期"
            rules={[{ required: true, message: '请选择交易日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="merchant"
            label="商家"
          >
            <Input placeholder="商家名称" />
          </Form.Item>

          <Form.Item
            name="tag_ids"
            label="标签"
          >
            <Select
              mode="multiple"
              placeholder="请选择标签"
              allowClear
            >
              {tags.map(tag => (
                <Option key={tag.id} value={tag.id}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input placeholder="交易描述" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
