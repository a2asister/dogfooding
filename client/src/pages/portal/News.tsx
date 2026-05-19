import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Pagination, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { portalApi } from '../../api';
import type { News } from '../../types';

const { Option } = Select;

const News: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('');

  const pageSize = 10;

  useEffect(() => {
    loadNews();
  }, [page, category]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data: any = await portalApi.getNewsList({
        category: category || undefined,
        page,
        pageSize,
      });
      setNews(data.list || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载新闻失败', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['校园新闻', '学术动态', '通知公告', '招生信息', '就业信息'];

  return (
    <div>
      <h1 className="page-title">新闻动态</h1>

      <Card className="card-shadow">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>分类：</span>
          <Select
            placeholder="选择分类"
            style={{ width: 150 }}
            allowClear
            value={category || undefined}
            onChange={(value) => {
              setCategory(value || '');
              setPage(1);
            }}
          >
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </div>

        <Spin spinning={loading}>
          <List
            dataSource={news}
            renderItem={(item) => (
              <List.Item
                className="news-item"
                onClick={() => navigate(`/news/${item.id}`)}
                style={{ padding: '20px 0' }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="news-item-title" style={{ fontSize: '18px' }}>
                        {item.title}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="blue">{item.category}</Tag>
                      <span style={{ color: '#999', marginRight: '15px' }}>
                        作者：{item.author}
                      </span>
                      <span style={{ color: '#999', marginRight: '15px' }}>
                        发布时间：{item.publishTime}
                      </span>
                      <span style={{ color: '#999' }}>
                        阅读量：{item.views}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>

        {total > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default News;
