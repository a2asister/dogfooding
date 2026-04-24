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
  DatePicker,
  Tag,
  Space,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  FundOutlined,
  StockOutlined,
  HomeOutlined,
  CarOutlined,
  CreditCardOutlined,
  RedEnvelopeOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Asset, Liability } from '../types';

const { Option } = Select;
const { TabPane } = Tabs;

const assetTypeMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  bank_deposit: { label: '银行卡存款', icon: <BankOutlined />, color: 'blue' },
  fixed_deposit: { label: '定期存款', icon: <SafetyCertificateOutlined />, color: 'gold' },
  wealth_management: { label: '理财产品', icon: <RiseOutlined />, color: 'green' },
  fund: { label: '基金', icon: <FundOutlined />, color: 'cyan' },
  stock: { label: '股票', icon: <StockOutlined />, color: 'red' },
  other_asset: { label: '其他资产', icon: <SafetyCertificateOutlined />, color: 'default' },
};

const liabilityTypeMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  mortgage: { label: '房贷', icon: <HomeOutlined />, color: 'blue' },
  car_loan: { label: '车贷', icon: <CarOutlined />, color: 'orange' },
  credit_card: { label: '信用卡', icon: <CreditCardOutlined />, color: 'gold' },
  personal_loan: { label: '个人贷款', icon: <RedEnvelopeOutlined />, color: 'red' },
  other_liability: { label: '其他负债', icon: <SafetyCertificateOutlined />, color: 'default' },
};

const AssetsLiabilities: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'asset' | 'liability'>('asset');
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(null);
  const [form] = Form.useForm();

  const { currentUser } = useAuth();

  const loadData = () => {
    setLoading(true);
    try {
      setAssets(storage.getAssets());
      setLiabilities(storage.getLiabilities());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAsset = () => {
    setModalType('asset');
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'bank_deposit',
    });
    setIsModalOpen(true);
  };

  const handleAddLiability = () => {
    setModalType('liability');
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'mortgage',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Asset | Liability, type: 'asset' | 'liability') => {
    setModalType(type);
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      maturityDate: (record as Asset).maturityDate ? dayjs((record as Asset).maturityDate) : undefined,
      nextPaymentDate: (record as Liability).nextPaymentDate ? dayjs((record as Liability).nextPaymentDate) : undefined,
      endDate: (record as Liability).endDate ? dayjs((record as Liability).endDate) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: 'asset' | 'liability') => {
    if (type === 'asset') {
      const asset = storage.getAssetById(id);
      storage.deleteAsset(id);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '删除',
        module: '资产管理',
        description: `删除了资产: ${asset?.name}`,
        details: { assetId: id },
      });
    } else {
      const liability = storage.getLiabilityById(id);
      storage.deleteLiability(id);
      
      storage.addLog({
        userId: currentUser!.id,
        action: '删除',
        module: '负债管理',
        description: `删除了负债: ${liability?.name}`,
        details: { liabilityId: id },
      });
    }
    message.success('删除成功');
    loadData();
  };

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      maturityDate: values.maturityDate?.format('YYYY-MM-DD'),
      nextPaymentDate: values.nextPaymentDate?.format('YYYY-MM-DD'),
      endDate: values.endDate?.format('YYYY-MM-DD'),
      createdBy: currentUser!.id,
    };

    if (modalType === 'asset') {
      const assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        type: data.type,
        value: data.value,
        expectedReturn: data.expectedReturn,
        maturityDate: data.maturityDate,
        description: data.description,
        createdBy: data.createdBy,
      };

      if (editingItem && 'value' in editingItem) {
        storage.updateAsset(editingItem.id, assetData);
        
        storage.addLog({
          userId: currentUser!.id,
          action: '编辑',
          module: '资产管理',
          description: `编辑了资产: ${values.name}`,
          details: { assetId: editingItem.id },
        });
        
        message.success('资产更新成功');
      } else {
        storage.addAsset(assetData);
        
        storage.addLog({
          userId: currentUser!.id,
          action: '新增',
          module: '资产管理',
          description: `新增了资产: ${values.name}`,
          details: { name: values.name, value: values.value },
        });
        
        message.success('资产添加成功');
      }
    } else {
      const liabilityData: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        type: data.type,
        totalAmount: data.totalAmount,
        remainingAmount: data.remainingAmount,
        interestRate: data.interestRate,
        monthlyPayment: data.monthlyPayment,
        nextPaymentDate: data.nextPaymentDate,
        endDate: data.endDate,
        description: data.description,
        createdBy: data.createdBy,
      };

      if (editingItem && 'totalAmount' in editingItem) {
        storage.updateLiability(editingItem.id, liabilityData);
        
        storage.addLog({
          userId: currentUser!.id,
          action: '编辑',
          module: '负债管理',
          description: `编辑了负债: ${values.name}`,
          details: { liabilityId: editingItem.id },
        });
        
        message.success('负债更新成功');
      } else {
        storage.addLiability(liabilityData);
        
        storage.addLog({
          userId: currentUser!.id,
          action: '新增',
          module: '负债管理',
          description: `新增了负债: ${values.name}`,
          details: { name: values.name, totalAmount: values.totalAmount },
        });
        
        message.success('负债添加成功');
      }
    }

    setIsModalOpen(false);
    loadData();
  };

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remainingAmount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetColumns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Asset) => (
        <Space>
          <span style={{ fontSize: 18 }}>{assetTypeMap[record.type]?.icon}</span>
          {name}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const config = assetTypeMap[type];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '当前价值',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>¥{value.toFixed(2)}</span>
      ),
    },
    {
      title: '预期收益',
      dataIndex: 'expectedReturn',
      key: 'expectedReturn',
      width: 100,
      render: (rate: number) => (rate !== undefined ? `${rate}%` : '-'),
    },
    {
      title: '到期日期',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
      width: 120,
      render: (date: string) => date || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Asset) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, 'asset')}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个资产吗？" onConfirm={() => handleDelete(record.id, 'asset')}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const liabilityColumns = [
    {
      title: '负债名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Liability) => (
        <Space>
          <span style={{ fontSize: 18 }}>{liabilityTypeMap[record.type]?.icon}</span>
          {name}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const config = liabilityTypeMap[type];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right' as const,
      render: (value: number) => <span style={{ color: '#ff4d4f' }}>¥{value.toFixed(2)}</span>,
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{value.toFixed(2)}</span>
      ),
    },
    {
      title: '利率',
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: 80,
      render: (rate: number) => (rate !== undefined ? `${rate}%` : '-'),
    },
    {
      title: '月还款',
      dataIndex: 'monthlyPayment',
      key: 'monthlyPayment',
      width: 100,
      render: (value: number) => (value !== undefined ? `¥${value.toFixed(2)}` : '-'),
    },
    {
      title: '下次还款日',
      dataIndex: 'nextPaymentDate',
      key: 'nextPaymentDate',
      width: 120,
      render: (date: string) => date || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Liability) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, 'liability')}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个负债吗？" onConfirm={() => handleDelete(record.id, 'liability')}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="assets-liabilities-page">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总资产"
              value={totalAssets}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总负债"
              value={totalLiabilities}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="家庭净资产"
              value={netWorth}
              precision={2}
              prefix="¥"
              valueStyle={{ color: netWorth >= 0 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'assets' | 'liabilities')}>
        <TabPane
          tab={
            <span>
              <BankOutlined /> 资产管理 ({assets.length})
            </span>
          }
          key="assets"
        >
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAsset}>
                添加资产
              </Button>
            }
          >
            <Table
              columns={assetColumns}
              dataSource={assets}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 项资产`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SafetyCertificateOutlined /> 负债管理 ({liabilities.length})
            </span>
          }
          key="liabilities"
        >
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLiability}>
                添加负债
              </Button>
            }
          >
            <Table
              columns={liabilityColumns}
              dataSource={liabilities}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 项负债`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={modalType === 'asset' ? (editingItem ? '编辑资产' : '添加资产') : (editingItem ? '编辑负债' : '添加负债')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder={modalType === 'asset' ? '例如：工商银行卡存款' : '例如：房贷'} />
          </Form.Item>

          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              {Object.entries(modalType === 'asset' ? assetTypeMap : liabilityTypeMap).map(([value, config]) => (
                <Option key={value} value={value}>
                  <Space>
                    {config.icon}
                    {config.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {modalType === 'asset' ? (
            <>
              <Form.Item name="value" label="当前价值" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入当前价值"
                  prefix="¥"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="expectedReturn" label="预期收益率(%)">
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="例如：3.5"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maturityDate" label="到期日期">
                    <DatePicker style={{ width: '100%' }} placeholder="选择到期日期" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="totalAmount" label="总金额" rules={[{ required: true, type: 'number', min: 0 }]}>
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="请输入总金额"
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="remainingAmount" label="剩余金额" rules={[{ required: true, type: 'number', min: 0 }]}>
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="请输入剩余金额"
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="interestRate" label="利率(%)">
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="例如：4.5"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="monthlyPayment" label="月还款">
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="月还款金额"
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="nextPaymentDate" label="下次还款日">
                    <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="endDate" label="结束日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择结束日期" />
              </Form.Item>
            </>
          )}

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="可选，输入描述信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '保存修改' : '确认添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetsLiabilities;
