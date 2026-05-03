import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Popconfirm,
  message,
  Card,
  Input,
  Select,
  TagProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { microAppRegistry } from '@/services/microAppRegistry';
import {
  MicroApp,
  APP_STATUS_LABELS,
  APP_CATEGORIES,
  formatDateShort,
  searchApps,
  filterAppsByStatus,
  filterAppsByCategory,
} from '@/shared';

const { Title, Text } = Typography;
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

const AppManage: React.FC = () => {
  const [apps, setApps] = useState<MicroApp[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MicroApp['status'] | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadApps = () => {
    setLoading(true);
    setTimeout(() => {
      setApps(microAppRegistry.apps);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const filteredApps = (() => {
    let result = apps;
    result = searchApps(result, searchKeyword);
    result = filterAppsByStatus(result, selectedStatus || undefined);
    result = filterAppsByCategory(result, selectedCategory || undefined);
    return result;
  })();

  const handleDelete = (id: string) => {
    microAppRegistry.removeApp(id);
    loadApps();
    message.success('应用已删除');
  };

  const columns: ColumnsType<MicroApp> = [
    {
      title: '应用信息',
      dataIndex: 'displayName',
      key: 'appInfo',
      width: 280,
      render: (_: string, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#fff',
            }}
          >
            {record.displayName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#000' }}>
              {record.displayName}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              /{record.name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const categoryInfo = APP_CATEGORIES.find((c) => c.value === category);
        return (
          <Tag color="blue" style={{ borderRadius: 4 }}>
            {categoryInfo?.label || category}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: MicroApp['status']) => (
        <Tag color={getStatusTagColor(status)} style={{ borderRadius: 4 }}>
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
      title: '版本数',
      dataIndex: 'versions',
      key: 'versionCount',
      width: 80,
      align: 'center',
      render: (versions: MicroApp['versions']) => versions.length,
    },
    {
      title: '路由数',
      dataIndex: 'routes',
      key: 'routeCount',
      width: 80,
      align: 'center',
      render: (routes: MicroApp['routes']) => routes.length,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      render: (date: string) => formatDateShort(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/app-manage/${record.id}`)}
            style={{ color: '#1890ff' }}
          >
            详情
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/app-manage/${record.id}?edit=true`)}
            style={{ color: '#52c41a' }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后数据无法恢复，确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#000', fontWeight: 600 }}>
            应用管理
          </Title>
          <Text style={{ color: '#666', marginTop: 8, display: 'block' }}>
            管理微应用的注册、版本和路由配置
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/app-manage/create')}
          style={{ borderRadius: 6, height: 40, padding: '0 24px' }}
        >
          新建应用
        </Button>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
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
            placeholder="搜索应用名称、描述"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 280, minWidth: 200 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />

          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140, minWidth: 100 }}
            value={selectedStatus || undefined}
            onChange={(value) => setSelectedStatus(value as MicroApp['status'])}
            options={[
              { value: 'developing', label: '开发中' },
              { value: 'testing', label: '测试中' },
              { value: 'staging', label: '预发布' },
              { value: 'production', label: '生产环境' },
              { value: 'disabled', label: '已禁用' },
            ]}
          />

          <Select
            placeholder="分类筛选"
            allowClear
            style={{ width: 140, minWidth: 100 }}
            value={selectedCategory || undefined}
            onChange={setSelectedCategory}
            options={APP_CATEGORIES}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={loadApps}
            style={{ marginLeft: 'auto' }}
          >
            刷新
          </Button>

          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px', borderRadius: 4 }}>
            共 {filteredApps.length} 个应用
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={filteredApps}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
        />
      </Card>
    </div>
  );
};

export default AppManage;
