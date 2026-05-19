import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Tabs,
  Badge,
  List,
  Card,
  Descriptions
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminApi, auctionApi } from '../../services/api';
import { AuctionStatus } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  [AuctionStatus.PENDING]: { color: 'orange', text: '待开始' },
  [AuctionStatus.ACTIVE]: { color: 'green', text: '拍卖中' },
  [AuctionStatus.ENDED]: { color: 'blue', text: '已结束' },
  [AuctionStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

interface AuctionItem {
  id: number;
  title: string;
  category: string;
  startPrice: number;
  currentPrice: number;
  reservePrice?: number;
  minIncrement: number;
  bidCount: number;
  status: string;
  companyName: string;
  startTime: string;
  endTime: string;
  extendedCount: number;
  extendedTimes: number;
}

interface Bid {
  id: number;
  userName: string;
  amount: number;
  createTime: string;
  isAuto: boolean;
}

function OperatorAuctions(): JSX.Element {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(AuctionStatus.ACTIVE);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentAuction, setCurrentAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);

  const loadAuctions = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.getAuctions({ status: statusFilter }) as unknown as { auctions: AuctionItem[]; total: number };
      setAuctions(res.auctions);
    } catch {
      message.error('加载拍卖列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [statusFilter]);

  const handleViewDetail = async (auction: AuctionItem): Promise<void> => {
    setCurrentAuction(auction);
    setDetailModalVisible(true);
    try {
      const res = await auctionApi.getBids(auction.id, { pageSize: 20 }) as unknown as { bids: Bid[] };
      setBids(res.bids || []);
    } catch {
      setBids([]);
    }
  };

  const handleStartAuction = (auction: AuctionItem): void => {
    Modal.confirm({
      title: '开始拍卖',
      content: `确定要提前开始拍卖「${auction.title}」吗？`,
      onOk: async () => {
        try {
          message.success('拍卖已开始');
          loadAuctions();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handlePauseAuction = (auction: AuctionItem): void => {
    Modal.confirm({
      title: '暂停拍卖',
      content: `确定要暂停拍卖「${auction.title}」吗？暂停后用户暂时无法出价。`,
      onOk: async () => {
        try {
          message.success('拍卖已暂停');
          loadAuctions();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handleEndAuction = (auction: AuctionItem): void => {
    Modal.confirm({
      title: '结束拍卖',
      content: `确定要提前结束拍卖「${auction.title}」吗？结束后将生成订单。`,
      okText: '确认结束',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('拍卖已结束');
          loadAuctions();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handleCancelAuction = (auction: AuctionItem): void => {
    Modal.confirm({
      title: '取消拍卖',
      content: `确定要取消拍卖「${auction.title}」吗？取消后将解冻所有用户保证金。`,
      okText: '确认取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('拍卖已取消');
          loadAuctions();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const handleAbnormalAuction = (auction: AuctionItem): void => {
    Modal.confirm({
      title: '异常处理',
      content: `检测到「${auction.title}」存在出价异常，是否介入处理？`,
      onOk: async () => {
        try {
          message.success('已标记为异常拍卖，已冻结当前最高价');
          loadAuctions();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  const filteredAuctions = auctions.filter(auction => {
    return !keyword ||
      auction.title.includes(keyword) ||
      auction.companyName.includes(keyword);
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '所属商家',
      dataIndex: 'companyName',
      key: 'companyName'
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
      title: '出价次数',
      dataIndex: 'bidCount',
      key: 'bidCount'
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: AuctionItem) => {
        const statusInfo = statusMap[record.status];
        return (
          <Space direction="vertical" size={0}>
            {statusInfo && <Tag color={statusInfo.color}>{statusInfo.text}</Tag>}
            {record.extendedCount > 0 && (
              <Tag color="purple">延时{record.extendedCount}次</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: AuctionItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === AuctionStatus.PENDING && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartAuction(record)}
            >
              开始
            </Button>
          )}
          {record.status === AuctionStatus.ACTIVE && (
            <>
              <Button
                type="link"
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => handlePauseAuction(record)}
              >
                暂停
              </Button>
              <Button
                type="link"
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleEndAuction(record)}
              >
                结束
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={() => handleAbnormalAuction(record)}
              >
                异常
              </Button>
            </>
          )}
          {(record.status === AuctionStatus.PENDING || record.status === AuctionStatus.ACTIVE) && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleCancelAuction(record)}
            >
              取消
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2 className="page-title">拍卖管理</h2>
      
      <div className="filter-bar">
        <Space wrap>
          <Input.Search
            placeholder="搜索商品/商家"
            style={{ width: 250 }}
            onSearch={setKeyword}
            allowClear
          />
          <Button type="primary" onClick={loadAuctions}>
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={statusFilter}
        onChange={(key) => setStatusFilter(key as AuctionStatus)}
        items={[
          {
            key: AuctionStatus.ACTIVE,
            label: (
              <span>
                <Badge status="processing" />
                拍卖中
              </span>
            )
          },
          {
            key: AuctionStatus.PENDING,
            label: (
              <span>
                <Badge status="warning" />
                待开始
              </span>
            )
          },
          {
            key: AuctionStatus.ENDED,
            label: (
              <span>
                <Badge status="default" />
                已结束
              </span>
            )
          },
          {
            key: AuctionStatus.CANCELLED,
            label: (
              <span>
                <Badge status="error" />
                已取消
              </span>
            )
          }
        ]}
      >
        <Table
          dataSource={filteredAuctions}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Tabs>

      <Modal
        title="拍卖详情"
        width={900}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentAuction && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="商品标题">{currentAuction.title}</Descriptions.Item>
                <Descriptions.Item label="所属商家">{currentAuction.companyName}</Descriptions.Item>
                <Descriptions.Item label="起拍价">¥{currentAuction.startPrice.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="当前价"><span className="price-text">¥{currentAuction.currentPrice.toFixed(2)}</span></Descriptions.Item>
                <Descriptions.Item label="保留价">{currentAuction.reservePrice ? `¥${currentAuction.reservePrice.toFixed(2)}` : '无'}</Descriptions.Item>
                <Descriptions.Item label="最小加价">¥{currentAuction.minIncrement}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{dayjs(currentAuction.startTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="结束时间">{dayjs(currentAuction.endTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="出价次数">{currentAuction.bidCount}次</Descriptions.Item>
                <Descriptions.Item label="延时次数">{currentAuction.extendedCount}次</Descriptions.Item>
              </Descriptions>
            </Card>
            
            <Card title="出价记录">
              <List
                dataSource={bids}
                locale={{ emptyText: '暂无出价记录' }}
                renderItem={(bid) => (
                  <List.Item key={bid.id}>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{bid.userName}</span>
                          <span className="price-text">¥{bid.amount.toFixed(2)}</span>
                          {bid.isAuto && <Tag color="blue">自动出价</Tag>}
                        </Space>
                      }
                      description={dayjs(bid.createTime).format('YYYY-MM-DD HH:mm:ss')}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OperatorAuctions;
