import { useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Space } from 'antd';
import {
  FileTextOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Order, Medication } from '../../types';

const { Title } = Typography;

const orderTypeLabels: Record<string, string> = {
  outpatient: '门诊',
  inpatient: '住院',
  pharmacy: '药房',
  lab: '检验',
  imaging: '检查',
};

const orderTypeColors: Record<string, string> = {
  outpatient: 'blue',
  inpatient: 'purple',
  pharmacy: 'green',
  lab: 'orange',
  imaging: 'cyan',
};

const orderStatusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
};

const orderStatusColors: Record<string, string> = {
  pending: 'orange',
  paid: 'green',
  cancelled: 'default',
  refunded: 'red',
};

export default function ChargeDashboard() {
  const { orders, loadAll: loadCommon } = useCommonStore();
  const { patients, loadAll: loadPatient } = usePatientStore();
  const { medications, loadAll: loadHospital } = useHospitalStore();

  useEffect(() => {
    loadCommon();
    loadPatient();
    loadHospital();
  }, [loadCommon, loadPatient, loadHospital]);

  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter((o) => o.status === 'paid' && o.paymentTime?.startsWith(today))
      .reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'pending');
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'paid');
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || '-';
  };

  const columns: ColumnsType<Order> = [
    {
      title: '患者姓名',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (patientId) => getPatientName(patientId),
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (type) => (
        <Tag color={orderTypeColors[type]}>{orderTypeLabels[type]}</Tag>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span style={{ color: '#fa8c16' }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '支付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => (
        <span style={{ color: '#52c41a' }}>{amount ? `¥${amount.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={orderStatusColors[status]}>{orderStatusLabels[status]}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        收费后勤工作台
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
            title="今日营收"
            value={todayRevenue}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={pendingOrders.length}
              prefix={<FileTextOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={paidOrders.length}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="药品种类"
              value={medications.length}
              prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近订单">
        <Table
          columns={columns}
          dataSource={recentOrders.slice(0, 10)}
          rowKey="id"
          size="middle"
          pagination={false}
        />
      </Card>
    </div>
  );
}
