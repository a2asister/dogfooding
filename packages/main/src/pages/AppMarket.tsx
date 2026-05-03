import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Tag,
  Typography,
  Empty,
  Button,
  TagProps,
} from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { microAppRegistry } from '@/services/microAppRegistry';
import {
  MicroApp,
  APP_CATEGORIES,
  APP_STATUS_LABELS,
  searchApps,
  filterAppsByCategory,
  filterAppsByStatus,
} from '@/shared';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const getStatusTagColor = (status: MicroApp['status']): TagProps['color'] => {
  const colorMap: Record<MicroApp['status'], TagProps['color']> = {
    developing: 'processing',
    testing: 'warning',
    staging: 'default',
    production: 'success',
    disabled: 'error',
  };
  return colorMap[status];
};

const getCardGradient = (status: MicroApp['status']): string => {
  const gradientMap: Record<MicroApp['status'], string> = {
    developing: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    testing: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    staging: 'linear-gradient(135deg, #8c8c8c 0%, #595959 100%)',
    production: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    disabled: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
  };
  return gradientMap[status];
};

const AppMarket: React.FC = () => {
  const [apps, setApps] = useState<MicroApp[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<MicroApp['status'] | ''>('');
  const navigate = useNavigate();

  useEffect(() => {
    setApps(microAppRegistry.apps);
  }, []);

  const filteredApps = useMemo(() => {
    let result = apps;
    result = searchApps(result, searchKeyword);
    result = filterAppsByCategory(result, selectedCategory || undefined);
    result = filterAppsByStatus(result, selectedStatus || undefined);
    return result;
  }, [apps, searchKeyword, selectedCategory, selectedStatus]);

  const handleAppClick = (app: MicroApp) => {
    if (app.status === 'production' || app.status === 'staging') {
      navigate(`/app/${app.name}`);
    } else {
      navigate(`/app-manage/${app.id}`);
    }
  };

  const renderAppCard = (app: MicroApp) => (
    <Card
      key={app.id}
      hoverable
      className="app-card"
      style={{
        borderRadius: 12,
        overflow: 'hidden',
      }}
      onClick={() => handleAppClick(app)}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: 24,
          background: getCardGradient(app.status),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
            }}
          >
            <AppstoreOutlined />
          </div>
          <Tag color={getStatusTagColor(app.status)} style={{ margin: 0, borderRadius: 4 }}>
            {APP_STATUS_LABELS[app.status]}
          </Tag>
        </div>

        <Title
          level={4}
          style={{
            color: '#fff',
            margin: '16px 0 8px',
            fontWeight: 600,
          }}
        >
          {app.displayName}
        </Title>
        <Text
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
          }}
        >
          /{app.name} · v{app.currentVersion}
        </Text>
      </div>

      <div style={{ padding: 20 }}>
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            color: '#666',
            fontSize: 13,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          {app.description}
        </Paragraph>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              作者: {app.author}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              路由: {app.routes.length} 个
            </Text>
          </div>

          <Button
            type="primary"
            shape="circle"
            icon={<PlayCircleOutlined />}
            size="large"
            style={{
              background: app.status === 'production' || app.status === 'staging' ? '#1890ff' : '#d9d9d9',
              borderColor: app.status === 'production' || app.status === 'staging' ? '#1890ff' : '#d9d9d9',
            }}
            disabled={app.status !== 'production' && app.status !== 'staging'}
            onClick={(e) => {
              e.stopPropagation();
              handleAppClick(app);
            }}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0, color: '#000', fontWeight: 600 }}>
          应用市场
        </Title>
        <Text style={{ color: '#666', marginTop: 8, display: 'block' }}>
          浏览和使用已注册的微应用
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Search
          placeholder="搜索应用名称或描述"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 320, minWidth: 200 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="large"
        />

        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 160, minWidth: 120 }}
          value={selectedCategory || undefined}
          onChange={setSelectedCategory}
          size="large"
          options={APP_CATEGORIES}
        />

        <Select
          placeholder="选择状态"
          allowClear
          style={{ width: 160, minWidth: 120 }}
          value={selectedStatus || undefined}
          onChange={(value) => setSelectedStatus(value as MicroApp['status'])}
          size="large"
          options={[
            { value: 'developing', label: '开发中' },
            { value: 'testing', label: '测试中' },
            { value: 'staging', label: '预发布' },
            { value: 'production', label: '生产环境' },
            { value: 'disabled', label: '已禁用' },
          ]}
        />

        <Tag
          color="blue"
          style={{
            marginLeft: 'auto',
            fontSize: 14,
            padding: '4px 12px',
            borderRadius: 4,
          }}
        >
          共 {filteredApps.length} 个应用
        </Tag>
      </div>

      {filteredApps.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {filteredApps.map(renderAppCard)}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 80,
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 14 }}>
                {searchKeyword || selectedCategory || selectedStatus
                  ? '没有找到符合条件的应用'
                  : '暂无应用，请先在应用管理中添加应用'}
              </Text>
            }
          />
        </div>
      )}
    </div>
  );
};

export default AppMarket;
