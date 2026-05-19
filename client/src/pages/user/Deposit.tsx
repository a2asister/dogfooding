import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Table, Statistic, Row, Col, Modal, message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../store/useStore';

interface DepositRecord {
  id: number;
  amount: number;
  type: string;
  status: string;
  remark: string;
  createdAt: string;
}

const typeMap: Record<string, string> = {
  recharge: '充值',
  freeze: '冻结',
  release: '解冻',
  deduct: '扣除',
  withdraw: '提现'
};

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '处理中' },
  frozen: { color: 'blue', text: '已冻结' },
  released: { color: 'green', text: '已完成' },
  deducted: { color: 'red', text: '已扣除' }
};

function Deposit(): JSX.Element {
  const { user, setUser } = useAuthStore();
  const [records, setRecords] = useState<DepositRecord[]>([]);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [rechargeForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const loadRecords = async (): Promise<void> => {
    try {
      const res = await userApi.getDepositRecords() as unknown as { records: DepositRecord[]; total: number };
      setRecords(res.records);
    } catch {
      // Error handled
    }
  };

  const loadProfile = async (): Promise<void> => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadRecords();
    loadProfile();
  }, []);

  const handleRecharge = async (values: { amount: number }): Promise<void> => {
    try {
      await userApi.recharge(values.amount);
      message.success('充值成功');
      setRechargeModalVisible(false);
      rechargeForm.resetFields();
      loadRecords();
      loadProfile();
    } catch {
      // Error handled
    }
  };

  const handleWithdraw = async (values: { amount: number }): Promise<void> => {
    try {
      await userApi.withdraw(values.amount);
      message.success('提现成功');
      setWithdrawModalVisible(false);
      withdrawForm.resetFields();
      loadRecords();
      loadProfile();
    } catch {
      // Error handled
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => typeMap[type] || type
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: DepositRecord) => (
        <span style={{ 
          color: ['recharge', 'release'].includes(record.type) ? '#52c41a' : '#ff4d4f' 
        }}>
          {['recharge', 'release'].includes(record.type) ? '+' : '-'}{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status] || { color: 'default', text: status };
        return <span style={{ color: info.color }}>{info.text}</span>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    }
  ];

  return (
    <div>
      <h2 className="page-title">保证金管理</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="账户余额" 
              value={user?.balance || 0} 
              prefix="¥" 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="冻结余额" 
              value={user?.frozenBalance || 0} 
              prefix="¥" 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block
                onClick={() => setRechargeModalVisible(true)}
              >
                充值
              </Button>
              <Button 
                icon={<MinusOutlined />} 
                block
                onClick={() => setWithdrawModalVisible(true)}
              >
                提现
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="资金明细">
        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="账户充值"
        open={rechargeModalVisible}
        onCancel={() => setRechargeModalVisible(false)}
        footer={null}
      >
        <Form form={rechargeForm} layout="vertical" onFinish={handleRecharge}>
          <Form.Item
            name="amount"
            label="充值金额"
            rules={[
              { required: true, message: '请输入充值金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              step={100}
              prefix="¥"
              placeholder="请输入充值金额"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认充值
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="账户提现"
        open={withdrawModalVisible}
        onCancel={() => setWithdrawModalVisible(false)}
        footer={null}
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item
            name="amount"
            label="提现金额"
            rules={[
              { required: true, message: '请输入提现金额' },
              { 
                type: 'number', 
                min: 0.01, 
                max: user?.balance || 0,
                message: `金额必须在0.01-${user?.balance?.toFixed(2) || 0}之间` 
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              max={user?.balance || 0}
              step={100}
              prefix="¥"
              placeholder="请输入提现金额"
            />
          </Form.Item>
          <p style={{ color: '#666', fontSize: 12 }}>
            可提现余额：¥{user?.balance?.toFixed(2) || 0}
          </p>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认提现
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Deposit;
