import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { orderApi } from '../../services/api';
import { Order, OrderStatus } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { color: 'orange', text: '待支付' },
  [OrderStatus.PAID]: { color: 'blue', text: '已支付' },
  [OrderStatus.SHIPPED]: { color: 'cyan', text: '已发货' },
  [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
  [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

function Orders(): JSX.Element {
  const navigate = useNavigate();
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  const loadOrders = async (role: string): Promise<void> => {
    try {
      const res = await orderApi.getList({ role });
      if (role === 'buyer') {
        setBuyerOrders(res.orders);
      } else {
        setSellerOrders(res.orders);
      }
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadOrders('buyer');
    loadOrders('seller');
  }, []);

  const handlePay = async (order: Order): Promise<void> => {
    Modal.confirm({
      title: '确认支付',
      content: `确定要支付订单 ¥${order.amount.toFixed(2)} 吗？`,
      onOk: async () => {
        try {
          await orderApi.pay(order.id);
          message.success('支付成功');
          loadOrders('buyer');
        } catch {
          // Error handled
        }
      }
    });
  };

  const handleCancel = async (order: Order): Promise<void> => {
    Modal.confirm({
      title: '取消订单',
      content: '确定要取消订单吗？取消后将扣除50%的保证金作为违约金。',
      okText: '确认取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await orderApi.cancel(order.id);
          message.success('订单已取消');
          loadOrders('buyer');
        } catch {
          // Error handled
        }
      }
    });
  };

  const handleConfirm = async (order: Order): Promise<void> => {
    Modal.confirm({
      title: '确认收货',
      content: '确定已收到商品吗？',
      onOk: async () => {
        try {
          await orderApi.confirm(order.id);
          message.success('确认收货成功');
          loadOrders('buyer');
        } catch {
          // Error handled
        }
      }
    });
  };

  const columns = (isBuyer: boolean) => [
    {
      title: '商品信息',
      key: 'auction',
      render: (_: unknown, record: Order) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/auction/${record.auctionId}`)}>
          <img 
            src={record.auctionImages?.split(',')[0]} 
            alt="" 
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.auctionTitle}</div>
            <div style={{ color: '#999', fontSize: 12 }}>订单号：{record.orderNo}</div>
          </div>
        </div>
      )
    },
    {
      title: isBuyer ? '卖家' : '买家',
      dataIndex: isBuyer ? 'sellerName' : 'buyerName',
      key: 'name'
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
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{status}</Tag>;
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
      render: (_: unknown, record: Order) => {
        if (isBuyer) {
          return (
            <Space>
              {record.status === OrderStatus.PENDING_PAYMENT && (
                <>
                  <Button type="primary" size="small" onClick={() => handlePay(record)}>
                    立即支付
                  </Button>
                  <Button size="small" danger onClick={() => handleCancel(record)}>
                    取消订单
                  </Button>
                </>
              )}
              {record.status === OrderStatus.SHIPPED && (
                <Button type="primary" size="small" onClick={() => handleConfirm(record)}>
                  确认收货
                </Button>
              )}
            </Space>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div>
      <h2 className="page-title">我的订单</h2>
      
      <Tabs
        items={[
          {
            key: 'buyer',
            label: '我买到的',
            children: (
              <Table
                dataSource={buyerOrders}
                columns={columns(true)}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )
          },
          {
            key: 'seller',
            label: '我卖出的',
            children: (
              <Table
                dataSource={sellerOrders}
                columns={columns(false)}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )
          }
        ]}
      />
    </div>
  );
}

export default Orders;
