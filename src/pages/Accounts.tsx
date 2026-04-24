import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Space,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WalletOutlined,
  MoneyCollectOutlined,
  CreditCardOutlined,
  PayCircleOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import type { Account } from '../types';

const { Option } = Select;

const accountTypeMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  cash: { label: '现金', icon: <MoneyCollectOutlined />, color: 'gold' },
  bank: { label: '银行卡', icon: <CreditCardOutlined />, color: 'blue' },
  alipay: { label: '支付宝', icon: <PayCircleOutlined />, color: 'blue' },
  wechat: { label: '微信', icon: <WalletOutlined />, color: 'green' },
  credit: { label: '信用卡', icon: <CreditCardOutlined />, color: 'orange' },
  other: { label: '其他', icon: <WalletOutlined />, color: 'default' },
};

const Accounts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();

  const { currentUser, isAdmin } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      const allAccounts = storage.getAccounts();
      const filteredAccounts = allAccounts.filter((a) => {
        if (isAdmin) return true;
        return a.isPublic || a.createdBy === currentUser?.id;
      });
      setAccounts(filteredAccounts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'cash',
      balance: 0,
      isPublic: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Account) => {
    setEditingAccount(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const account = storage.getAccountById(id);
    if (account && account.balance !== 0) {
      message.warning('该账户还有余额，请先处理余额后再删除');
      return;
    }
    storage.deleteAccount(id);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '删除',
      module: '支付账户',
      description: `删除了账户: ${account?.name}`,
      details: { accountId: id },
    });
    
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    const accountData = {
      ...values,
      createdBy: currentUser!.id,
    };

    if (editingAccount) {
      storage.updateAccount(editingAccount.id, accountData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '编辑',
        module: '支付账户',
        description: `编辑了账户: ${values.name}`,
        details: { accountId: editingAccount.id },
      });
      
      message.success('更新成功');
    } else {
      storage.addAccount(accountData);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '新增',
        module: '支付账户',
        description: `新增了账户: ${values.name}`,
        details: { name: values.name, type: values.type },
      });
      
      message.success('添加成功');
    }

    setIsModalOpen(false);
    loadData();
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const columns = [
    {
      title: '账户名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Account) => (
        <Space>
          <span style={{ fontSize: 18 }}>{accountTypeMap[record.type]?.icon}</span>
          {name}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const config = accountTypeMap[type];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 150,
      align: 'right' as const,
      render: (balance: number) => (
        <span style={{ fontWeight: 'bold', color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ¥{balance.toFixed(2)}
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
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? '正常' : '停用'}
        </Tag>
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
      render: (_: unknown, record: Account) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个账户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="accounts-page">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="账户总余额"
              value={totalBalance}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="账户数量"
              value={accounts.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="活跃账户"
              value={accounts.filter((a) => a.isActive).length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="支付账户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加账户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个账户`,
          }}
        />
      </Card>

      <Modal
        title={editingAccount ? '编辑账户' : '添加账户'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="账户名称" rules={[{ required: true, message: '请输入账户名称' }]}>
            <Input placeholder="例如：中国银行卡" />
          </Form.Item>

          <Form.Item name="type" label="账户类型" rules={[{ required: true }]}>
            <Select>
              {Object.entries(accountTypeMap).map(([value, config]) => (
                <Option key={value} value={value}>
                  <Space>
                    {config.icon}
                    {config.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="balance" label="初始余额" rules={[{ required: true, type: 'number' }]}>
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入初始余额"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="可选，输入账户描述" />
          </Form.Item>

          <Form.Item name="isPublic" label="公开可见" valuePropName="checked">
            <Select>
              <Option value={true}>公开（所有成员可见）</Option>
              <Option value={false}>私有（仅自己可见）</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="账户状态" valuePropName="checked">
            <Select>
              <Option value={true}>正常</Option>
              <Option value={false}>停用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingAccount ? '保存修改' : '确认添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
