import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
} from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Order, OrderItem, Medication } from '../../types';

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

const itemTypeLabels: Record<string, string> = {
  medication: '药品',
  service: '服务',
  lab: '检验',
  imaging: '检查',
  bed: '床位',
  nursing: '护理',
};

export default function OrderManagement() {
  const { orders, orderItems, loadAll: loadCommon, updateOrderStatus } = useCommonStore();
  const { patients, loadAll: loadPatient } = usePatientStore();
  const { medications, loadAll: loadHospital } = useHospitalStore();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadCommon();
    loadPatient();
    loadHospital();
  }, [loadCommon, loadPatient, loadHospital]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filterStatus) {
      result = result.filter((o) => o.status === filterStatus);
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [orders, filterStatus]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || '-';
  };

  const getOrderItems = (orderId: string) => {
    return orderItems.filter((item) => item.orderId === orderId);
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setViewModalVisible(true);
  };

  const handlePay = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      const updated = updateOrderStatus(id, 'paid', order.totalAmount);
      if (updated) {
        message.success('支付成功');
      }
    }
  };

  const handleCancel = (id: string) => {
    const updated = updateOrderStatus(id, 'cancelled');
    if (updated) {
      message.success('订单已取消');
    }
  };

  const handleRefund = (id: string) => {
    const updated = updateOrderStatus(id, 'refunded');
    if (updated) {
      message.success('退款成功');
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 8)}...</span>,
    },
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
      render: (amount) => <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '支付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {amount !== undefined ? `¥${amount.toFixed(2)}` : '-'}
        </span>
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
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handlePay(record.id)}>
              收费
            </Button>
          )}
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要取消该订单吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<CloseOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
          {record.status === 'paid' && (
            <Popconfirm
              title="确定要退款吗？"
              onConfirm={() => handleRefund(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>
                退款
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const orderItemColumns: ColumnsType<OrderItem> = [
    {
      title: '项目类型',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (type) => <Tag>{itemTypeLabels[type]}</Tag>,
    },
    {
      title: '项目名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <span style={{ color: '#fa8c16' }}>¥{price.toFixed(2)}</span>,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        订单管理
      </Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Select
            placeholder="筛选订单状态"
            style={{ width: 150 }}
            allowClear
            value={filterStatus || undefined}
            onChange={(value) => setFilterStatus(value)}
          >
            <Select.Option value="pending">待支付</Select.Option>
            <Select.Option value="paid">已支付</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
            <Select.Option value="refunded">已退款</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条订单`,
          }}
        />
      </Card>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>订单编号：</Typography.Text>
              {selectedOrder.id}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>患者：</Typography.Text>
              {getPatientName(selectedOrder.patientId)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>订单类型：</Typography.Text>
              <Tag color={orderTypeColors[selectedOrder.orderType]}>
                {orderTypeLabels[selectedOrder.orderType]}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>状态：</Typography.Text>
              <Tag color={orderStatusColors[selectedOrder.status]}>
                {orderStatusLabels[selectedOrder.status]}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>总金额：</Typography.Text>
              <span style={{ color: '#fa8c16', fontSize: 18, fontWeight: 'bold' }}>
                ¥{selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>
            {selectedOrder.paidAmount !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>支付金额：</Typography.Text>
                <span style={{ color: '#52c41a', fontSize: 18, fontWeight: 'bold' }}>
                  ¥{selectedOrder.paidAmount.toFixed(2)}
                </span>
              </div>
            )}
            {selectedOrder.paymentMethod && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>支付方式：</Typography.Text>
                {selectedOrder.paymentMethod}
              </div>
            )}
            {selectedOrder.invoiceNumber && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>发票号：</Typography.Text>
                {selectedOrder.invoiceNumber}
              </div>
            )}
            {selectedOrder.notes && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>备注：</Typography.Text>
                {selectedOrder.notes}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>创建时间：</Typography.Text>
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </div>

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              订单明细
            </Typography.Title>
            <Table
              columns={orderItemColumns}
              dataSource={getOrderItems(selectedOrder.id)}
              rowKey="id"
              size="small"
              pagination={false}
              summary={(pageData) => {
                let total = 0;
                pageData.forEach((item) => {
                  total += item.totalPrice;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <strong>合计：</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <strong style={{ color: '#fa8c16', fontSize: 16 }}>
                        ¥{total.toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
