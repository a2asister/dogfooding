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
  Tabs,
  Radio,
  Row,
  Col,
  Upload,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ImportOutlined,
  ExportOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Transaction, Category, Account } from '../types';
import type { UploadProps } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Transactions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchParams, setSearchParams] = useState({
    categoryId: undefined as string | undefined,
    accountId: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
    keyword: '',
  });

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
      setAccounts(storage.getAccounts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingTransaction(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'expense',
      date: dayjs(),
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Transaction) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const transaction = storage.getTransactionById(id);
    if (transaction) {
      if (transaction.type === 'income') {
        storage.updateAccountBalance(transaction.accountId, -transaction.amount);
      } else if (transaction.type === 'expense') {
        storage.updateAccountBalance(transaction.accountId, transaction.amount);
      } else if (transaction.type === 'transfer') {
        storage.updateAccountBalance(transaction.accountId, transaction.amount);
        if (transaction.toAccountId) {
          storage.updateAccountBalance(transaction.toAccountId, -transaction.amount);
        }
      }
    }
    
    storage.deleteTransaction(id);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '删除',
      module: '交易记录',
      description: `删除了一笔${transaction?.type === 'income' ? '收入' : transaction?.type === 'expense' ? '支出' : '转账'}记录`,
      details: { transactionId: id },
    });
    
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    if (values.type === 'transfer' && values.accountId === values.toAccountId) {
      message.error('转出账户和转入账户不能相同');
      return;
    }

    const transactionData = {
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      accountId: values.accountId,
      toAccountId: values.toAccountId,
      description: values.description,
      date: values.date.format('YYYY-MM-DD'),
      createdBy: currentUser!.id,
      isPublic: values.isPublic,
      tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    if (editingTransaction) {
      const oldTransaction = storage.getTransactionById(editingTransaction.id);
      if (oldTransaction) {
        if (oldTransaction.type === 'income') {
          storage.updateAccountBalance(oldTransaction.accountId, -oldTransaction.amount);
        } else if (oldTransaction.type === 'expense') {
          storage.updateAccountBalance(oldTransaction.accountId, oldTransaction.amount);
        } else if (oldTransaction.type === 'transfer') {
          storage.updateAccountBalance(oldTransaction.accountId, oldTransaction.amount);
          if (oldTransaction.toAccountId) {
            storage.updateAccountBalance(oldTransaction.toAccountId, -oldTransaction.amount);
          }
        }
      }

      storage.updateTransaction(editingTransaction.id, transactionData);
      
      if (values.type === 'income') {
        storage.updateAccountBalance(values.accountId, values.amount);
      } else if (values.type === 'expense') {
        storage.updateAccountBalance(values.accountId, -values.amount);
      } else if (values.type === 'transfer') {
        storage.updateAccountBalance(values.accountId, -values.amount);
        if (values.toAccountId) {
          storage.updateAccountBalance(values.toAccountId, values.amount);
        }
      }

      storage.addLog({
        userId: currentUser!.id,
        action: '编辑',
        module: '交易记录',
        description: `编辑了一笔${values.type === 'income' ? '收入' : values.type === 'expense' ? '支出' : '转账'}记录`,
        details: { transactionId: editingTransaction.id },
      });
      
      message.success('更新成功');
    } else {
      storage.addTransaction(transactionData);
      
      if (values.type === 'income') {
        storage.updateAccountBalance(values.accountId, values.amount);
      } else if (values.type === 'expense') {
        storage.updateAccountBalance(values.accountId, -values.amount);
      } else if (values.type === 'transfer') {
        storage.updateAccountBalance(values.accountId, -values.amount);
        if (values.toAccountId) {
          storage.updateAccountBalance(values.toAccountId, values.amount);
        }
      }

      storage.addLog({
        userId: currentUser!.id,
        action: '新增',
        module: '交易记录',
        description: `新增了一笔${values.type === 'income' ? '收入' : values.type === 'expense' ? '支出' : '转账'}记录`,
        details: { amount: values.amount },
      });
      
      message.success('添加成功');
    }

    setIsModalOpen(false);
    loadData();
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab !== 'all' && t.type !== activeTab) return false;
    if (searchParams.categoryId && t.categoryId !== searchParams.categoryId) return false;
    if (searchParams.accountId && t.accountId !== searchParams.accountId && t.toAccountId !== searchParams.accountId) return false;
    if (searchParams.dateRange) {
      const date = dayjs(t.date);
      if (date.isBefore(searchParams.dateRange[0]) || date.isAfter(searchParams.dateRange[1])) return false;
    }
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase();
      const category = categories.find((c) => c.id === t.categoryId);
      if (
        !t.description?.toLowerCase().includes(keyword) &&
        !category?.name.toLowerCase().includes(keyword)
      ) return false;
    }
    return true;
  });

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'income' ? 'green' : type === 'expense' ? 'red' : 'blue'}>
          {type === 'income' ? '收入' : type === 'expense' ? '支出' : '转账'}
        </Tag>
      ),
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
      title: '账户',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (accountId: string, record: Transaction) => {
        const fromAccount = accounts.find((a) => a.id === accountId);
        const toAccount = record.toAccountId ? accounts.find((a) => a.id === record.toAccountId) : null;
        if (record.type === 'transfer' && toAccount) {
          return <span>{fromAccount?.name} → {toAccount?.name}</span>;
        }
        return fromAccount?.name || '-';
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number, record: Transaction) => (
        <span style={{ 
          color: record.type === 'income' ? '#52c41a' : record.type === 'expense' ? '#ff4d4f' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {record.type === 'income' ? '+' : record.type === 'transfer' ? '±' : '-'}¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      render: (_: unknown, record: Transaction) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这笔记录吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
      }
      return isImage;
    },
    fileList: [],
  };

  const transactionType = Form.useWatch('type', form);

  return (
    <div className="transactions-page">
      <Card
        title="记账管理"
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>导入</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              快速记账
            </Button>
          </Space>
        }
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="选择分类"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => setSearchParams({ ...searchParams, categoryId: value })}
              >
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="选择账户"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => setSearchParams({ ...searchParams, accountId: value })}
              >
                {accounts.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) =>
                  setSearchParams({
                    ...searchParams,
                    dateRange: dates ? [dates[0]!, dates[1]!] : undefined,
                  })
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input.Search
                placeholder="搜索描述或分类"
                prefix={<SearchOutlined />}
                onSearch={(value) => setSearchParams({ ...searchParams, keyword: value })}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="收入" key="income" />
          <TabPane tab="支出" key="expense" />
          <TabPane tab="转账" key="transfer" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingTransaction ? '编辑记录' : '快速记账'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="expense">支出</Radio.Button>
              <Radio.Button value="income">收入</Radio.Button>
              <Radio.Button value="transfer">转账</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="amount" label="金额" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入金额"
              prefix="¥"
            />
          </Form.Item>

          {transactionType !== 'transfer' && (
            <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
              <Select placeholder="请选择分类">
                {categories
                  .filter((c) => c.type === transactionType)
                  .map((c) => (
                    <Option key={c.id} value={c.id}>
                      <span style={{ color: c.color }}>{c.icon}</span> {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="accountId" label={transactionType === 'transfer' ? '转出账户' : '账户'} rules={[{ required: true }]}>
            <Select placeholder="请选择账户">
              {accounts.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.name} (余额: ¥{a.balance.toFixed(2)})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {transactionType === 'transfer' && (
            <Form.Item name="toAccountId" label="转入账户" rules={[{ required: true }]}>
              <Select placeholder="请选择转入账户">
                {accounts.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.name} (余额: ¥{a.balance.toFixed(2)})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="可选，输入备注信息" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>

          <Form.Item name="voucher" label="上传凭证">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>上传凭证</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="isPublic" label="公开可见" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTransaction ? '保存修改' : '确认记账'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
