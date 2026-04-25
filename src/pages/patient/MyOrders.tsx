import { useEffect, useMemo } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import { usePatientStore } from '../../stores/patientStore';
import { useAuthStore } from '../../stores/authStore';
import type { ColumnsType } from 'antd/es/table';
import type { Order, OrderItem } from '../../types';

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

export default function MyOrders() {
  const { currentUser } = useAuthStore();
  const { patients, loadAll: loadPatient } = usePatientStore();
  const { orders, orderItems, loadAll: loadCommon } = useCommonStore();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadPatient();
    loadCommon();
  }, [loadPatient, loadCommon]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.userId === currentUser?.id);
  }, [patients, currentUser]);

  const myOrders = useMemo(() => {
    if (!currentPatient) return [];
    return [...orders]
      .filter((o) => o.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentPatient]);

  const getOrderItems = (orderId: string) => {
    return orderItems.filter((item) => item.orderId === orderId);
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setViewModalVisible(true);
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 12)}...</span>,
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
      render: (amount) => (
        <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>
      ),
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
      title: '医保报销',
      dataIndex: 'insuranceClaim',
      key: 'insuranceClaim',
      render: (amount) => (
        <span style={{ color: '#1890ff' }}>
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
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          详情
        </Button>
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
        我的订单
      </Title>

      <Card>
        {myOrders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={myOrders}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条订单`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无订单记录
          </div>
        )}
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
            {selectedOrder.discountAmount !== undefined && selectedOrder.discountAmount > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>优惠金额：</Typography.Text>
                <span style={{ color: '#52c41a' }}>-¥{selectedOrder.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {selectedOrder.paidAmount !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>支付金额：</Typography.Text>
                <span style={{ color: '#52c41a', fontSize: 18, fontWeight: 'bold' }}>
                  ¥{selectedOrder.paidAmount.toFixed(2)}
                </span>
              </div>
            )}
            {selectedOrder.insuranceCoverage !== undefined && selectedOrder.insuranceCoverage > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>医保报销比例：</Typography.Text>
                <span style={{ color: '#1890ff' }}>{selectedOrder.insuranceCoverage}%</span>
              </div>
            )}
            {selectedOrder.insuranceClaim !== undefined && selectedOrder.insuranceClaim > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>医保报销金额：</Typography.Text>
                <span style={{ color: '#1890ff' }}>¥{selectedOrder.insuranceClaim.toFixed(2)}</span>
              </div>
            )}
            {selectedOrder.paymentMethod && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>支付方式：</Typography.Text>
                {selectedOrder.paymentMethod}
              </div>
            )}
            {selectedOrder.paymentTime && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>支付时间：</Typography.Text>
                {new Date(selectedOrder.paymentTime).toLocaleString()}
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
