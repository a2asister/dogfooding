import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Select,
  message,
  Tabs,
  Card,
  Descriptions,
  Steps,
  Timeline,
  Row,
  Col
} from 'antd';

import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { OrderStatus } from '../../types';

const { Option } = Select;

const statusMap: Record<string, { color: string; text: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { color: 'orange', text: '待支付' },
  [OrderStatus.PAID]: { color: 'blue', text: '已支付' },
  [OrderStatus.SHIPPED]: { color: 'cyan', text: '已发货' },
  [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
  [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

interface Order {
  id: number;
  orderNo: string;
  auctionId: number;
  auctionTitle: string;
  auctionImages?: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  deposit: number;
  commission: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
}

interface OrderLog {
  id: number;
  action: string;
  operator: string;
  remark: string;
  createTime: string;
}

function OperatorOrders(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderLogs, setOrderLogs] = useState<OrderLog[]>([]);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const params: { status?: string } = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getOrders(params) as unknown as { orders: Order[]; total: number };
      setOrders(res.orders);
    } catch {
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleViewDetail = async (order: Order): Promise<void> => {
    setCurrentOrder(order);
    setDetailModalVisible(true);
    setOrderLogs([
      { id: 1, action: '订单创建', operator: '系统', remark: '拍卖成交，订单自动生成', createTime: order.createdAt },
      { id: 2, action: '发送通知', operator: '系统', remark: '已向买家和卖家发送订单通知', createTime: dayjs(order.createdAt).add(1, 'minute').toISOString() }
    ]);
  };

  const handleRemindPayment = (order: Order): void => {
    Modal.confirm({
      title: '催付提醒',
      content: `确定要向买家 ${order.buyerName} 发送支付提醒吗？`,
      onOk: async () => {
        try {
          message.success('已发送支付提醒');
        } catch {
          message.error('发送失败');
        }
      }
    });
  };

  const handleCancelOrder = (order: Order): void => {
    Modal.confirm({
      title: '取消订单',
      content: `确定要取消订单 ${order.orderNo} 吗？买家已支付的款项将原路退回。`,
      okText: '确认取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('订单已取消');
          loadOrders();
        } catch {
          message.error('取消失败');
        }
      }
    });
  };

  const handleRefund = (order: Order): void => {
    Modal.confirm({
      title: '退款处理',
      content: `确定要为订单 ${order.orderNo} 退款 ¥${order.amount.toFixed(2)} 吗？`,
      okText: '确认退款',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('退款成功');
          loadOrders();
        } catch {
          message.error('退款失败');
        }
      }
    });
  };

  const handleCompleteOrder = (order: Order): void => {
    Modal.confirm({
      title: '完成订单',
      content: `确定要将订单 ${order.orderNo} 标记为完成吗？`,
      onOk: async () => {
        try {
          message.success('订单已完成');
          loadOrders();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handleAppeal = (order: Order): void => {
    Modal.confirm({
      title: '处理申诉',
      content: `订单 ${order.orderNo} 存在申诉，是否介入处理？`,
      onOk: async () => {
        try {
          message.success('已介入处理');
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const filteredOrders = orders.filter(order => {
    return !keyword ||
      order.orderNo.includes(keyword) ||
      order.auctionTitle.includes(keyword) ||
      order.buyerName.includes(keyword) ||
      order.sellerName.includes(keyword);
  });

  const getOrderSteps = (order: Order): { status: 'wait' | 'process' | 'finish' | 'error'; title: string }[] => {
    const steps: { status: 'wait' | 'process' | 'finish' | 'error'; title: string }[] = [
      { status: 'finish', title: '创建订单' },
      { status: 'wait', title: '买家付款' },
      { status: 'wait', title: '卖家发货' },
      { status: 'wait', title: '确认收货' },
      { status: 'wait', title: '订单完成' }
    ];

    if (order.status === OrderStatus.CANCELLED) {
      steps[1] = { status: 'error', title: '买家付款' };
      return steps;
    }
    if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.COMPLETED) {
      steps[1] = { status: 'finish', title: '买家付款' };
    }
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.COMPLETED) {
      steps[2] = { status: 'finish', title: '卖家发货' };
    }
    if (order.status === OrderStatus.COMPLETED) {
      steps[3] = { status: 'finish', title: '确认收货' };
      steps[4] = { status: 'finish', title: '订单完成' };
    }

    return steps;
  };

  const columns = [
    {
      title: '订单信息',
      key: 'info',
      render: (_: unknown, record: Order) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={record.auctionImages?.split(',')[0]}
            alt=""
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.auctionTitle}</div>
            <div style={{ color: '#999', fontSize: 12 }}>订单号：{record.orderNo}</div>
          </div>
        </div>
      )
    },
    {
      title: '买家',
      dataIndex: 'buyerName',
      key: 'buyerName'
    },
    {
      title: '卖家',
      dataIndex: 'sellerName',
      key: 'sellerName'
    },
    {
      title: '金额',
      key: 'amount',
      render: (_: unknown, record: Order) => (
        <div>
          <div className="price-text">¥{record.amount.toFixed(2)}</div>
          <div style={{ color: '#999', fontSize: 12 }}>保证金：¥{record.deposit.toFixed(2)}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status];
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{status}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === OrderStatus.PENDING_PAYMENT && (
            <>
              <Button type="link" size="small" onClick={() => handleRemindPayment(record)}>
                催付
              </Button>
              <Button type="link" size="small" danger onClick={() => handleCancelOrder(record)}>
                取消
              </Button>
            </>
          )}
          {record.status === OrderStatus.PAID && (
            <Button type="link" size="small" onClick={() => handleCompleteOrder(record)}>
              标记完成
            </Button>
          )}
          {record.status === OrderStatus.CANCELLED && (
            <Button type="link" size="small" danger onClick={() => handleRefund(record)}>
              退款
            </Button>
          )}
          <Button type="link" size="small" onClick={() => handleAppeal(record)}>
            申诉
          </Button>
        </Space>
      )
    }
  ];

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING_PAYMENT).length;
  const paidCount = orders.filter(o => o.status === OrderStatus.PAID).length;
  const shippedCount = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
  const completedCount = orders.filter(o => o.status === OrderStatus.COMPLETED).length;

  return (
    <div>
      <h2 className="page-title">订单管理</h2>
      
      <div className="filter-bar">
        <Space wrap>
          <Input.Search
            placeholder="搜索订单号/商品/用户"
            style={{ width: 250 }}
            onSearch={setKeyword}
            allowClear
          />
          <Select
            placeholder="订单状态"
            style={{ width: 150 }}
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value as string)}
            allowClear
          >
            <Option value={OrderStatus.PENDING_PAYMENT}>待支付</Option>
            <Option value={OrderStatus.PAID}>已支付</Option>
            <Option value={OrderStatus.SHIPPED}>已发货</Option>
            <Option value={OrderStatus.COMPLETED}>已完成</Option>
            <Option value={OrderStatus.CANCELLED}>已取消</Option>
          </Select>
          <Button type="primary" onClick={loadOrders}>
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={statusFilter || 'all'}
        onChange={(key) => setStatusFilter(key === 'all' ? '' : key)}
        items={[
          { key: 'all', label: `全部 (${orders.length})` },
          { key: OrderStatus.PENDING_PAYMENT, label: `待支付 (${pendingCount})` },
          { key: OrderStatus.PAID, label: `已支付 (${paidCount})` },
          { key: OrderStatus.SHIPPED, label: `已发货 (${shippedCount})` },
          { key: OrderStatus.COMPLETED, label: `已完成 (${completedCount})` }
        ]}
      >
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Tabs>

      <Modal
        title="订单详情"
        width={900}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentOrder && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Steps
                current={getOrderSteps(currentOrder).findIndex(s => s.status === 'wait' || s.status === 'error')}
                items={getOrderSteps(currentOrder)}
                size="small"
              />
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="订单信息" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
                    <Descriptions.Item label="商品">{currentOrder.auctionTitle}</Descriptions.Item>
                    <Descriptions.Item label="订单金额">¥{currentOrder.amount.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="保证金">¥{currentOrder.deposit.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="平台佣金">¥{currentOrder.commission.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                    {currentOrder.paidAt && (
                      <Descriptions.Item label="支付时间">{dayjs(currentOrder.paidAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                    )}
                    {currentOrder.paymentMethod && (
                      <Descriptions.Item label="支付方式">{currentOrder.paymentMethod}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="买卖双方" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="买家">{currentOrder.buyerName}</Descriptions.Item>
                    <Descriptions.Item label="卖家">{currentOrder.sellerName}</Descriptions.Item>
                    <Descriptions.Item label="订单状态">
                      {(() => {
                        const statusInfo = statusMap[currentOrder.status];
                        return statusInfo ? <Tag color={statusInfo.color}>{statusInfo.text}</Tag> : null;
                      })()}
                    </Descriptions.Item>
                    {currentOrder.cancelReason && (
                      <Descriptions.Item label="取消原因">{currentOrder.cancelReason}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="操作日志" size="small">
              <Timeline
                items={orderLogs.map(log => ({
                  color: log.action.includes('取消') ? 'red' : 'blue',
                  children: (
                    <div>
                      <p style={{ margin: 0, fontWeight: 500 }}>{log.action}</p>
                      <p style={{ margin: 0, color: '#666' }}>{log.remark}</p>
                      <p style={{ margin: 0, color: '#999', fontSize: 12 }}>
                        操作人：{log.operator} · {dayjs(log.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </p>
                    </div>
                  )
                }))}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OperatorOrders;
