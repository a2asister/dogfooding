import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Row, Col, Card, Button, InputNumber, Statistic, Tag, 
  List, Avatar, message, Modal, Alert
} from 'antd';
import { 
  HeartOutlined, HeartFilled, ClockCircleOutlined, 
  UserOutlined, RiseOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { auctionApi, userApi } from '../../services/api';
import { AuctionItem, Bid, AuthStatus } from '../../types';
import { useAuthStore } from '../../store/useStore';

function AuctionDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [countdown, setCountdown] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!id) return;
    loadAuctionDetail();
    
    wsRef.current = new WebSocket(`ws://${window.location.host}/ws`);
    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({ type: 'subscribe', auctionId: Number(id) }));
    };
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'newBid') {
        setBids(prev => [{ ...data, nickname: data.nickname } as Bid, ...prev]);
        if (auction) {
          setAuction({ ...auction, currentPrice: data.amount, bidCount: auction.bidCount + 1 });
        }
        setBidAmount(data.amount + (auction?.minIncrement || 10));
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining(auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const loadAuctionDetail = async (): Promise<void> => {
    if (!id) return;
    try {
      const detail = await auctionApi.getDetail(Number(id));
      setAuction(detail);
      setBids(detail.bids || []);
      setBidAmount(detail.currentPrice + detail.minIncrement);
    } catch {
      // Error handled
    }
  };

  const getTimeRemaining = (endTime: string): string => {
    const end = dayjs(endTime);
    const now = dayjs();
    const diff = end.diff(now);
    
    if (diff <= 0) return '已结束';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
    if (hours > 0) return `${hours}时 ${minutes}分 ${seconds}秒`;
    return `${minutes}分 ${seconds}秒`;
  };

  const handleBid = async (): Promise<void> => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (user.authStatus !== AuthStatus.VERIFIED) {
      Modal.warning({
        title: '需要实名认证',
        content: '参与竞拍需要先完成实名认证，请前往个人中心完成认证。',
        onOk: () => navigate('/profile')
      });
      return;
    }

    if (!auction || !bidAmount) return;

    if (bidAmount < auction.currentPrice + auction.minIncrement) {
      message.error(`出价必须至少为 ${auction.currentPrice + auction.minIncrement} 元`);
      return;
    }

    Modal.confirm({
      title: '确认出价',
      content: `您确定要出价 ¥${bidAmount.toFixed(2)} 吗？出价后将冻结 ${(bidAmount * 0.1).toFixed(2)} 元保证金。`,
      onOk: async () => {
        setLoading(true);
        try {
          await auctionApi.placeBid(Number(id), bidAmount);
          message.success('出价成功');
          loadAuctionDetail();
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const toggleFavorite = async (): Promise<void> => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (isFavorite) {
        await userApi.removeFavorite(Number(id));
        setIsFavorite(false);
      } else {
        await userApi.addFavorite(Number(id));
        setIsFavorite(true);
      }
    } catch {
      // Error handled
    }
  };

  if (!auction) {
    return <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>;
  }

  return (
    <div>
      <Row gutter={24}>
        <Col span={14}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <img
                src={auction.images.split(',')[0]}
                alt={auction.title}
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {auction.images.split(',').map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                />
              ))}
            </div>
          </Card>

          <Card title="商品描述" style={{ marginTop: 16 }}>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{auction.description}</p>
          </Card>
        </Col>

        <Col span={10}>
          <Card>
            <h2 style={{ marginBottom: 16 }}>{auction.title}</h2>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Tag color="blue">{auction.category}</Tag>
              <Tag color="green">浏览 {auction.viewCount}</Tag>
              <Tag color="orange">出价 {auction.bidCount}</Tag>
              <Tag color="red">收藏 {auction.favoriteCount}</Tag>
            </div>

            <Alert
              message={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ fontSize: 20 }} />
                  <span>剩余时间：{countdown}</span>
                </div>
              }
              type="warning"
              showIcon={false}
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Statistic
                title="当前价格"
                value={auction.currentPrice}
                prefix="¥"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <Statistic
                title="起拍价"
                value={auction.startPrice}
                prefix="¥"
                valueStyle={{ color: '#999', fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <span>加价幅度：¥{auction.minIncrement}</span>
                {auction.reservePrice && (
                  <span style={{ marginLeft: 16 }}>保留价：¥{auction.reservePrice}</span>
                )}
              </div>
            </div>

            {user?.authStatus !== AuthStatus.VERIFIED && (
              <Alert
                message="参与竞拍需要先完成实名认证"
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <InputNumber
                min={auction.currentPrice + auction.minIncrement}
                step={auction.minIncrement}
                value={bidAmount}
                onChange={(value) => setBidAmount(value as number)}
                style={{ flex: 1 }}
                size="large"
                prefix="¥"
                disabled={user?.authStatus !== AuthStatus.VERIFIED}
              />
              <Button
                type="primary"
                size="large"
                icon={<RiseOutlined />}
                onClick={handleBid}
                loading={loading}
                disabled={user?.authStatus !== AuthStatus.VERIFIED}
              >
                立即出价
              </Button>
            </div>

            <Button
              icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={toggleFavorite}
              block
              size="large"
            >
              {isFavorite ? '已收藏' : '收藏商品'}
            </Button>
          </Card>

          <Card title="出价记录" style={{ marginTop: 16 }}>
            <List
              dataSource={bids}
              renderItem={(bid) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{bid.nickname || '匿名用户'}</span>
                        <span className="price-text">¥{bid.amount.toFixed(2)}</span>
                      </div>
                    }
                    description={dayjs(bid.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AuctionDetail;
