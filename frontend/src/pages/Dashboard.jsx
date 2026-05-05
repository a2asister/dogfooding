import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Empty, Spin, message } from 'antd';
import {
  FileTextOutlined,
  DatabaseOutlined,
  LinkOutlined,
  CloudOutlined,
  RocketOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { contentApi, modelApi, routeApi, publishApi } from '../services/api';

function Dashboard() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    contentCount: 0,
    publishedCount: 0,
    modelCount: 0,
    routeCount: 0,
    recentContents: []
  });

  useEffect(() => {
    if (currentSite) {
      loadStats();
    }
  }, [currentSite]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [contentRes, modelRes, routeRes] = await Promise.all([
        contentApi.getAll(currentSite.id, { limit: 100 }),
        modelApi.getAll(currentSite.id),
        routeApi.getAll(currentSite.id)
      ]);

      const contents = contentRes.data?.items || contentRes.data || [];
      const publishedCount = contents.filter(c => c.status === 'published').length;
      const recentContents = contents
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

      setStats({
        contentCount: contentRes.data?.total || contents.length,
        publishedCount,
        modelCount: modelRes.data?.length || 0,
        routeCount: routeRes.data?.length || 0,
        recentContents
      });
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: ['data', 'title'],
      key: 'title',
      render: (text, record) => text || record.data?.name || '-'
    },
    {
      title: 'URL别名',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={status === 'published' ? 'tag-published' : 'tag-draft'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    }
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header">
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>仪表盘</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            当前站点：{currentSite?.name || '未选择站点'}
          </p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stats-card stats-card-purple" bordered={false}>
              <Statistic
                title="内容总数"
                value={stats.contentCount}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stats-card stats-card-blue" bordered={false}>
              <Statistic
                title="已发布"
                value={stats.publishedCount}
                prefix={<RocketOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stats-card stats-card-green" bordered={false}>
              <Statistic
                title="内容模型"
                value={stats.modelCount}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stats-card stats-card-orange" bordered={false}>
              <Statistic
                title="路由规则"
                value={stats.routeCount}
                prefix={<LinkOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title="最近更新的内容"
              className="form-card"
              extra={<Tag color="blue">最近5条</Tag>}
            >
              {stats.recentContents.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={stats.recentContents}
                  rowKey="id"
                  pagination={false}
                  className="table-container"
                />
              ) : (
                <Empty
                  description="暂无内容"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card
              title="站点信息"
              className="form-card"
              bordered={false}
            >
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#6b7280' }}>站点名称</span>
                  <span style={{ fontWeight: 500 }}>{currentSite?.name || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#6b7280' }}>域名</span>
                  <span style={{ fontWeight: 500 }}>{currentSite?.domain || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#6b7280' }}>描述</span>
                  <span style={{ fontWeight: 500 }}>{currentSite?.description || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>状态</span>
                  <Tag className={currentSite?.status === 'active' ? 'tag-active' : 'tag-inactive'}>
                    {currentSite?.status === 'active' ? '活跃' : '未激活'}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card
              title="快速操作"
              className="form-card"
              bordered={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Card size="small" hoverable style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileTextOutlined style={{ fontSize: 24, color: '#667eea' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>创建新内容</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>添加新的内容条目</div>
                    </div>
                  </div>
                </Card>
                <Card size="small" hoverable style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <DatabaseOutlined style={{ fontSize: 24, color: '#4facfe' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>管理内容模型</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>配置内容结构</div>
                    </div>
                  </div>
                </Card>
                <Card size="small" hoverable style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RocketOutlined style={{ fontSize: 24, color: '#43e97b' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>发布内容</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>静态化并发布内容</div>
                    </div>
                  </div>
                </Card>
                <Card size="small" hoverable style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CloudOutlined style={{ fontSize: 24, color: '#fa709a' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>CDN 配置</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>配置内容分发网络</div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

export default Dashboard;
