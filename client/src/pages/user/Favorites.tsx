import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Empty, message } from 'antd';
import { HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { userApi } from '../../services/api';
import { AuctionItem } from '../../types';

function Favorites(): JSX.Element {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await userApi.getFavorites() as unknown as AuctionItem[];
      setFavorites(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (auctionId: number, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      await userApi.removeFavorite(auctionId);
      message.success('已取消收藏');
      setFavorites(prev => prev.filter(item => item.id !== auctionId));
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
    
    if (days > 0) return `${days}天${hours}时`;
    if (hours > 0) return `${hours}时${minutes}分`;
    return `${minutes}分`;
  };

  if (favorites.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Empty description="暂无收藏商品" />
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          去逛逛
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">我的收藏</h2>
      
      <Row gutter={[16, 16]}>
        {favorites.map((auction) => (
          <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
            <Card
              hoverable
              className="card-hover"
              cover={
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/auction/${auction.id}`)}>
                  <img
                    alt={auction.title}
                    src={auction.images.split(',')[0]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Button
                    type="text"
                    icon={<HeartFilled style={{ color: '#ff4d4f', fontSize: 20 }} />}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 32, height: 32, padding: 0 }}
                    onClick={(e) => handleRemoveFavorite(auction.id, e)}
                  />
                </div>
              }
              onClick={() => navigate(`/auction/${auction.id}`)}
            >
              <Card.Meta
                title={
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {auction.title}
                  </div>
                }
                description={
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="price-text" style={{ fontSize: 18 }}>
                        ¥{auction.currentPrice.toFixed(2)}
                      </span>
                      <Tag color="blue">{auction.category}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#ff4d4f' }}>
                      <ClockCircleOutlined /> {getTimeRemaining(auction.endTime)}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Favorites;
