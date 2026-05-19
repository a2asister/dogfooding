import React, { useEffect, useState } from 'react';
import { Card, Spin, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { portalApi } from '../../api';
import { News } from '../../types';

const NewsDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    if (id) {
      loadDetail(parseInt(id));
    }
  }, [id]);

  const loadDetail = async (newsId: number) => {
    setLoading(true);
    try {
      const data = await portalApi.getNewsDetail(newsId);
      setNews(data);
    } catch (error) {
      console.error('加载新闻详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/news')} style={{ marginBottom: '20px' }}>
        返回列表
      </Button>

      <Card className="card-shadow">
        <Spin spinning={loading}>
          {news && (
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>{news.title}</h1>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                <Tag color="blue">{news.category}</Tag>
                <span style={{ color: '#999', marginRight: '20px' }}>作者：{news.author}</span>
                <span style={{ color: '#999', marginRight: '20px' }}>发布时间：{news.publishTime}</span>
                <span style={{ color: '#999' }}>阅读量：{news.views}</span>
              </div>
              <div
                style={{ fontSize: '15px', lineHeight: '2', color: '#333' }}
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default NewsDetail;
