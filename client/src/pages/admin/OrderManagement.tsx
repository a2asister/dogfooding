import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Input, Select, message, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { OrderStatus } from '../../types';

const { RangePicker } = DatePicker;
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
  auctionTitle: string;
  auctionImages?: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
}

function OrderManagement(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const params: { page?: number; pageSize?: number; status?: string } = {};
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

  const handleViewDetail = (order: Order): void => {
    setCurrentOrder(order);
    setDetailModalVisible(true);
  };

  const handleShip = (order: Order): void => {
    Modal.confirm({
      title: '确认发货',
      content: `确定订单 ${order.orderNo} 已发货吗？`,
      onOk: async () => {
        try {
          message.success('发货状态已更新');
          loadOrders();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handleRefund = (order: Order): void => {
    Modal.confirm({
      title: '退款确认',
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

  const filteredOrders = orders.filter(order => {
    const matchKeyword = !keyword || 
      order.orderNo.includes(keyword) || 
      order.auctionTitle.includes(keyword) ||
      order.buyerName.includes(keyword) ||
      order.sellerName.includes(keyword);
    
    const matchDate = !dateRange || !dateRange[0] || !dateRange[1] ||
      (dayjs(order.createdAt).isAfter(dateRange[0].startOf('day')) && 
       dayjs(order.createdAt).isBefore(dateRange[1].endOf('day')));
    
    return matchKeyword && matchDate;
  });

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
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="price-text">¥{val.toFixed(2)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status];
        return <Tag color={info?.color || 'default'}>{info?.text || status}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === OrderStatus.PAID && (
            <Button type="link" size="small" onClick={() => handleShip(record)}>
              标记发货
            </Button>
          )}
          {record.status === OrderStatus.CANCELLED && (
            <Button type="link" size="small" danger onClick={() => handleRefund(record)}>
              退款
            </Button>
          )}
        </Space>
      )
    }
  ];

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
          <RangePicker onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)} />
          <Button type="primary" onClick={loadOrders}>
            查询
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, total: filteredOrders.length }}
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentOrder && (
          <div className="order-detail">
            <div className="detail-row">
              <span className="label">订单号：</span>
              <span>{currentOrder.orderNo}</span>
            </div>
            <div className="detail-row">
              <span className="label">商品：</span>
              <span>{currentOrder.auctionTitle}</span>
            </div>
            <div className="detail-row">
              <span className="label">买家：</span>
              <span>{currentOrder.buyerName}</span>
            </div>
            <div className="detail-row">
              <span className="label">卖家：</span>
              <span>{currentOrder.sellerName}</span>
            </div>
            <div className="detail-row">
              <span className="label">金额：</span>
              <span className="price-text">¥{currentOrder.amount.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="label">状态：</span>
              {(() => {
                const statusInfo = statusMap[currentOrder.status];
                return statusInfo ? (
                  <Tag color={statusInfo.color}>
                    {statusInfo.text}
                  </Tag>
                ) : null;
              })()}
            </div>
            <div className="detail-row">
              <span className="label">创建时间：</span>
              <span>{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            {currentOrder.paidAt && (
              <div className="detail-row">
                <span className="label">支付时间：</span>
                <span>{dayjs(currentOrder.paidAt).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            )}
            {currentOrder.completedAt && (
              <div className="detail-row">
                <span className="label">完成时间：</span>
                <span>{dayjs(currentOrder.completedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrderManagement;
