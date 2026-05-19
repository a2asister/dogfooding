import { useState, useEffect } from 'react';
import { Input, Select, Card, Row, Col, Pagination, Tag, Button, Empty } from 'antd';
import { SearchOutlined, FireOutlined, ClockCircleOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { auctionApi } from '../../services/api';
import { AuctionItem, AuctionStatus } from '../../types';

const { Search } = Input;
const { Option } = Select;

const categories = [
  { value: '', label: '全部分类' },
  { value: 'art', label: '艺术品' },
  { value: 'jewelry', label: '珠宝首饰' },
  { value: 'collectibles', label: '收藏品' },
  { value: 'electronics', label: '电子产品' },
  { value: 'furniture', label: '家具' },
  { value: 'other', label: '其他' }
];

function Home(): JSX.Element {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const pageSize = 12;

  const loadAuctions = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await auctionApi.getList({
        page,
        pageSize,
        keyword,
        category,
        sort,
        status: AuctionStatus.ACTIVE
      });
      setAuctions(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [page, keyword, category, sort]);

  const getTimeRemaining = (endTime: string): string => {
    const end = dayjs(endTime);
    const now = dayjs();
    const diff = end.diff(now);
    
    if (diff <= 0) return '已结束';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}天 ${hours}时 ${minutes}分`;
    if (hours > 0) return `${hours}时 ${minutes}分 ${seconds}秒`;
    return `${minutes}分 ${seconds}秒`;
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索拍卖商品..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 400 }}
          onSearch={(value) => { setKeyword(value); setPage(1); }}
        />
        <Select
          value={category}
          onChange={(value) => { setCategory(value); setPage(1); }}
          size="large"
          style={{ width: 150 }}
        >
          {categories.map(cat => (
            <Option key={cat.value} value={cat.value}>{cat.label}</Option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(value) => { setSort(value); setPage(1); }}
          size="large"
          style={{ width: 150 }}
        >
          <Option value="newest">最新发布</Option>
          <Option value="price_asc">价格从低到高</Option>
          <Option value="price_desc">价格从高到低</Option>
          <Option value="bids">出价最多</Option>
          <Option value="ending">即将结束</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        {auctions.length === 0 && !loading && (
          <Col span={24}>
            <Empty description="暂无拍卖商品" />
          </Col>
        )}
        {auctions.map((auction) => (
          <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
            <Card
              hoverable
              className="card-hover"
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img
                    alt={auction.title}
                    src={auction.images.split(',')[0]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              }
              actions={[
                <Button type="primary" size="small" onClick={() => navigate(`/auction/${auction.id}`)}>
                  立即竞拍
                </Button>
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
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
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
                      <span><EyeOutlined /> {auction.viewCount}</span>
                      <span><FireOutlined /> {auction.bidCount}</span>
                      <span><HeartOutlined /> {auction.favoriteCount}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#ff4d4f' }}>
                      <ClockCircleOutlined /> {getTimeRemaining(auction.endTime)}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {total > pageSize && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
