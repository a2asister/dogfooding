import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { merchantApi } from '../../services/api';
import { AuctionItem, AuctionStatus, AuthStatus } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  [AuctionStatus.DRAFT]: { color: 'default', text: '草稿' },
  [AuctionStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuctionStatus.ACTIVE]: { color: 'green', text: '拍卖中' },
  [AuctionStatus.ENDED]: { color: 'blue', text: '已结束' },
  [AuctionStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

const auditStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已通过' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

function MerchantAuctions(): JSX.Element {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);

  const loadAuctions = async (): Promise<void> => {
    try {
      const res = await merchantApi.getAuctions() as unknown as { items: AuctionItem[]; total: number };
      setAuctions(res.items);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  const handleDelete = (id: number, title: string): void => {
    Modal.confirm({
      title: '删除商品',
      content: `确定要删除「${title}」吗？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await merchantApi.deleteAuction(id);
          message.success('删除成功');
          loadAuctions();
        } catch {
          // Error handled
        }
      }
    });
  };

  const columns = [
    {
      title: '商品信息',
      key: 'item',
      render: (_: unknown, record: AuctionItem) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img 
            src={record.images.split(',')[0]} 
            alt="" 
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.title}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.category}</div>
          </div>
        </div>
      )
    },
    {
      title: '起拍价',
      dataIndex: 'startPrice',
      key: 'startPrice',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '当前价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (val: number) => <span className="price-text">¥{val.toFixed(2)}</span>
    },
    {
      title: '开拍时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: AuctionItem) => {
        const statusInfo = statusMap[record.status];
        const auditInfo = auditStatusMap[record.auditStatus];
        return (
          <Space direction="vertical" size={0}>
            {statusInfo && <Tag color={statusInfo.color}>{statusInfo.text}</Tag>}
            {auditInfo && <Tag color={auditInfo.color}>{auditInfo.text}</Tag>}
          </Space>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: AuctionItem) => (
        <Space>
          {record.status === AuctionStatus.PENDING && (
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/merchant/auction/edit/${record.id}`)}
            >
              编辑
            </Button>
          )}
          {record.status !== AuctionStatus.ACTIVE && (
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.title)}
            >
              删除
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title" style={{ margin: 0 }}>商品管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/merchant/auction/new')}
        >
          发布商品
        </Button>
      </div>

      <Table
        dataSource={auctions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default MerchantAuctions;
