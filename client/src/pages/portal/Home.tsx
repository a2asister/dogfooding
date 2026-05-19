import React, { useEffect, useState } from 'react';
import { Carousel, List, Card, Tag, Button } from 'antd';
import { RightOutlined, BookOutlined, ReadOutlined, TeamOutlined, MailOutlined, SafetyOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { portalApi } from '../../api';
import type { News } from '../../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [notices, setNotices] = useState<News[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data: any = await portalApi.getOverview();
      setLatestNews(data.latestNews || []);
      setNotices(data.notices || []);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const quickLinks = [
    { name: '教务系统', icon: <BookOutlined />, link: '/student/dashboard' },
    { name: '图书馆', icon: <ReadOutlined />, link: '/services' },
    { name: '招生就业', icon: <TeamOutlined />, link: '/admission' },
    { name: '校园邮箱', icon: <MailOutlined />, link: '#' },
    { name: 'VPN服务', icon: <GlobalOutlined />, link: '#' },
    { name: '校长信箱', icon: <SafetyOutlined />, link: '#' },
  ];

  const banners = [
    { title: '欢迎来到大学门户', subtitle: '博学笃行 厚德载物', className: 'banner-1' },
    { title: '2024年招生专题', subtitle: '欢迎报考我校', className: 'banner-2' },
    { title: '校园文化艺术节', subtitle: '丰富校园文化生活', className: 'banner-3' },
  ];

  return (
    <div>
      <div className="banner-container">
        <Carousel autoplay effect="fade">
          {banners.map((banner, idx) => (
            <div key={idx}>
              <div className={`banner-item ${banner.className}`}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>{banner.title}</div>
                  <div style={{ fontSize: '20px', opacity: 0.9 }}>{banner.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="quick-links">
        {quickLinks.map((link, idx) => (
          <div key={idx} className="quick-link-item" onClick={() => navigate(link.link)}>
            <div className="quick-link-icon">{link.icon}</div>
            <div className="quick-link-text">{link.name}</div>
          </div>
        ))}
      </div>

      <div className="two-column" style={{ marginTop: '20px' }}>
        <Card title="校园新闻" extra={<Button type="link" onClick={() => navigate('/news')}>查看更多 <RightOutlined /></Button>}>
          <List
            dataSource={latestNews}
            renderItem={(item) => (
              <List.Item className="news-item" onClick={() => navigate(`/news/${item.id}`)}>
                <List.Item.Meta
                  title={<span className="news-item-title">{item.title}</span>}
                  description={
                    <span className="news-item-meta">
                      <Tag color="blue">{item.category}</Tag>
                      {item.publishTime?.split(' ')[0]}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="通知公告">
          <List
            dataSource={notices}
            renderItem={(item) => (
              <List.Item className="news-item" onClick={() => navigate(`/news/${item.id}`)}>
                <List.Item.Meta
                  title={<span className="news-item-title" style={{ fontSize: '14px' }}>{item.title}</span>}
                  description={<span className="news-item-meta">{item.publishTime?.split(' ')[0]}</span>}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default Home;
