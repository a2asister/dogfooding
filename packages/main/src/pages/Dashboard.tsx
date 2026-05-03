import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, Typography, Empty } from 'antd';
import {
  AppstoreOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { microAppRegistry } from '@/services/microAppRegistry';
import {
  APP_STATUS_LABELS,
  APP_STATUS_COLORS,
  formatDateShort,
} from '@/shared';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [apps, setApps] = useState(microAppRegistry.apps);

  useEffect(() => {
    setApps(microAppRegistry.apps);
  }, []);

  const totalApps = apps.length;
  const productionApps = apps.filter((app) => app.status === 'production').length;
  const testingApps = apps.filter((app) => app.status === 'testing').length;
  const developingApps = apps.filter((app) => app.status === 'developing').length;

  const statCards = [
    {
      title: '应用总数',
      value: totalApps,
      icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
      trend: 'up' as const,
      trendValue: '2 款',
      color: '#1890ff',
    },
    {
      title: '生产环境',
      value: productionApps,
      icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      trend: 'up' as const,
      trendValue: '1 款',
      color: '#52c41a',
    },
    {
      title: '测试中',
      value: testingApps,
      icon: <RocketOutlined style={{ fontSize: 28, color: '#faad14' }} />,
      trend: 'down' as const,
      trendValue: '0 款',
      color: '#faad14',
    },
    {
      title: '开发中',
      value: developingApps,
      icon: <ClockCircleOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
      trend: 'up' as const,
      trendValue: '1 款',
      color: '#722ed1',
    },
  ];

  const tableColumns = [
    {
      title: '应用名称',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (_: string, record: typeof apps[0]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${record.status === 'production' ? '#52c41a' : record.status === 'testing' ? '#faad14' : '#1890ff'} 0%, #722ed1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            {record.displayName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: '#000' }}>{record.displayName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>/{record.name}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: typeof apps[0]['status']) => (
        <Tag color={APP_STATUS_COLORS[status]}>
          {APP_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: '当前版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 120,
      render: (version: string) => (
        <Text strong className="version-tag">
          v{version}
        </Text>
      ),
    },
    {
      title: '版本数量',
      dataIndex: 'versions',
      key: 'versionCount',
      width: 100,
      render: (versions: typeof apps[0]['versions']) => versions.length,
    },
    {
      title: '路由数量',
      dataIndex: 'routes',
      key: 'routeCount',
      width: 100,
      render: (routes: typeof apps[0]['routes']) => routes.length,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date: string) => formatDateShort(date),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0, color: '#000', fontWeight: 600 }}>
          数据看板
        </Title>
        <Text style={{ color: '#666', marginTop: 8, display: 'block' }}>
          微前端应用市场运行概览
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <Statistic
                    title={
                      <Text style={{ fontSize: 14, color: '#666', fontWeight: 400 }}>
                        {card.title}
                      </Text>
                    }
                    value={card.value}
                    valueStyle={{ color: '#000', fontWeight: 700, fontSize: 32 }}
                  />
                  <div
                    className={`stat-trend ${card.trend}`}
                    style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {card.trend === 'up' ? (
                      <ArrowUpOutlined style={{ fontSize: 12 }} />
                    ) : (
                      <ArrowDownOutlined style={{ fontSize: 12 }} />
                    )}
                    <Text style={{ fontSize: 12 }}>较上周 {card.trendValue}</Text>
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                应用列表
              </Title>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
            extra={
              <Tag color="blue" style={{ borderRadius: 4 }}>
                共 {totalApps} 个应用
              </Tag>
            }
          >
            {apps.length > 0 ? (
              <Table
                columns={tableColumns}
                dataSource={apps}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Empty description="暂无应用数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                环境分布
              </Title>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', height: '100%' }}
          >
            <div style={{ padding: '16px 0' }}>
              {[
                { name: '生产环境', value: productionApps, total: totalApps, color: '#52c41a' },
                { name: '预发布', value: apps.filter((a) => a.status === 'staging').length, total: totalApps, color: '#1890ff' },
                { name: '测试中', value: testingApps, total: totalApps, color: '#faad14' },
                { name: '开发中', value: developingApps, total: totalApps, color: '#722ed1' },
                { name: '已禁用', value: apps.filter((a) => a.status === 'disabled').length, total: totalApps, color: '#ff4d4f' },
              ].map((item, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{item.name}</Text>
                    <Text strong>
                      {item.value}/{item.total}
                    </Text>
                  </div>
                  <Progress
                    percent={item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}
                    showInfo={false}
                    strokeColor={item.color}
                    strokeWidth={8}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                最近更新
              </Title>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', height: '100%' }}
          >
            <div style={{ padding: '8px 0' }}>
              {[...apps]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5)
                .map((app, index) => (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: `linear-gradient(135deg, #1890ff 0%, #722ed1 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{app.displayName}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          v{app.currentVersion}
                        </Text>
                      </div>
                    </div>
                    <Tag color={APP_STATUS_COLORS[app.status]}>
                      {APP_STATUS_LABELS[app.status]}
                    </Tag>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
