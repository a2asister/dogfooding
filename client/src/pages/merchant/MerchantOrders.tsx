import { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { merchantApi } from '../../services/api';
import { Order, OrderStatus } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { color: 'orange', text: '待支付' },
  [OrderStatus.PAID]: { color: 'blue', text: '已支付' },
  [OrderStatus.SHIPPED]: { color: 'cyan', text: '已发货' },
  [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
  [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

function MerchantOrders(): JSX.Element {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async (): Promise<void> => {
    try {
      const res = await merchantApi.getOrders() as unknown as { orders: Order[]; total: number };
      setOrders(res.orders);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns = [
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
      title: '买家',
      dataIndex: 'buyerName',
      key: 'buyerName'
    },
    {
      title: '成交金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="price-text">¥{val.toFixed(2)}</span>
    },
    {
      title: '佣金',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '实际收入',
      key: 'income',
      render: (_: unknown, record: Order) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          ¥{(record.amount - record.commissionAmount).toFixed(2)}
        </span>
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
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    }
  ];

  return (
    <div>
      <h2 className="page-title">交易订单</h2>
      
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default MerchantOrders;
