import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Select,
  DatePicker,
  Progress,
  Statistic,
  Avatar,
  Badge,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  DownloadOutlined,
  SyncOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface LifecycleProps {
  container?: HTMLElement;
  appName?: string;
  appDisplayName?: string;
  version?: string;
  [key: string]: unknown;
}

interface TableData {
  key: string;
  name: string;
  status: string;
  visits: number;
  growth: number;
  date: string;
  avatar: string;
}

const App: React.FC<LifecycleProps> = ({ appName, appDisplayName, version }) => {
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setLoading(false);
    }, 1000);
  };

  const tableData: TableData[] = [
    {
      key: '1',
      name: '首页访问',
      status: 'success',
      visits: 12580,
      growth: 12.5,
      date: '2024-01-15',
      avatar: '首',
    },
    {
      key: '2',
      name: '数据分析',
      status: 'success',
      visits: 8920,
      growth: 8.2,
      date: '2024-01-15',
      avatar: '数',
    },
    {
      key: '3',
      name: '用户管理',
      status: 'processing',
      visits: 6450,
      growth: -3.1,
      date: '2024-01-15',
      avatar: '用',
    },
    {
      key: '4',
      name: '报表中心',
      status: 'warning',
      visits: 4280,
      growth: 15.6,
      date: '2024-01-15',
      avatar: '报',
    },
    {
      key: '5',
      name: '系统设置',
      status: 'error',
      visits: 2100,
      growth: -8.5,
      date: '2024-01-15',
      avatar: '系',
    },
  ];

  const columns: ColumnsType<TableData> = [
    {
      title: '页面名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space>
          <Avatar
            className="user-avatar"
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            }}
          >
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <span className={`status-tag status-${status}`}>
          {status === 'success' && '正常'}
          {status === 'warning' && '警告'}
          {status === 'processing' && '处理中'}
          {status === 'error' && '异常'}
        </span>
      ),
    },
    {
      title: '访问量',
      dataIndex: 'visits',
      key: 'visits',
      width: 120,
      align: 'right',
      render: (visits: number) => (
        <Text strong>{visits.toLocaleString()}</Text>
      ),
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      width: 120,
      align: 'right',
      render: (growth: number) => (
        <Space>
          {growth > 0 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
          <Text style={{ color: growth > 0 ? '#52c41a' : '#ff4d4f' }}>
            {Math.abs(growth)}%
          </Text>
        </Space>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
  ];

  const barHeights = [
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
    Math.floor(Math.random() * 100 + 80),
  ];

  const pieLegend = [
    { label: '直接访问', color: '#1890ff', percent: 35 },
    { label: '搜索引擎', color: '#52c41a', percent: 25 },
    { label: '邮件推广', color: '#faad14', percent: 15 },
    { label: '联盟广告', color: '#722ed1', percent: 15 },
    { label: '视频广告', color: '#ff4d4f', percent: 10 },
  ];

  return (
    <div className="app-container">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BarChartOutlined style={{ fontSize: 24 }} />
          <div>
            <div className="app-title">
              {appDisplayName || '数据看板'}
            </div>
            <Text style={{ fontSize: 12, opacity: 0.8 }}>
              /{appName || 'dashboard'}
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {version && (
            <span className="app-badge">
              v{version}
            </span>
          )}
          <Badge dot status="success">
            <Text style={{ color: '#fff', fontSize: 12 }}>
              运行中
            </Text>
          </Badge>
        </div>
      </div>

      <div className="app-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Title level={4} className="page-title" style={{ margin: 0 }}>
            数据概览
          </Title>
          <Space>
            <RangePicker
              defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
              style={{ width: 280 }}
            />
            <Select
              defaultValue="today"
              style={{ width: 120 }}
              options={[
                { value: 'today', label: '今日' },
                { value: 'week', label: '本周' },
                { value: 'month', label: '本月' },
                { value: 'quarter', label: '本季度' },
                { value: 'year', label: '本年' },
              ]}
            />
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              导出报表
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card">
              <Statistic
                title={<Text style={{ color: '#666' }}>总访问量</Text>}
                value={1258047}
                suffix={<Text style={{ fontSize: 14 }}>次</Text>}
                valueStyle={{ color: '#1890ff', fontWeight: 700 }}
              />
              <div className="stat-trend up">
                <ArrowUpOutlined />
                <Text>较昨日 +12.5%</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card">
              <Statistic
                title={<Text style={{ color: '#666' }}>活跃用户</Text>}
                value={88462}
                suffix={<Text style={{ fontSize: 14 }}>人</Text>}
                valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              />
              <div className="stat-trend up">
                <ArrowUpOutlined />
                <Text>较昨日 +8.2%</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card">
              <Statistic
                title={<Text style={{ color: '#666' }}>转化率</Text>}
                value={78.5}
                suffix={<Text style={{ fontSize: 14 }}>%</Text>}
                valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                precision={1}
              />
              <div className="stat-trend up">
                <ArrowUpOutlined />
                <Text>较昨日 +3.1%</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card">
              <Statistic
                title={<Text style={{ color: '#666' }}>平均停留时长</Text>}
                value={4}
                suffix={<Text style={{ fontSize: 14 }}>分钟</Text>}
                valueStyle={{ color: '#faad14', fontWeight: 700 }}
              />
              <div className="stat-trend down">
                <ArrowDownOutlined />
                <Text>较昨日 -2.5%</Text>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <div className="chart-container">
              <div className="table-header">
                <div className="table-title">
                  <LineChartOutlined style={{ marginRight: 8 }} />
                  访问趋势
                </div>
                <Space>
                  <Button size="small">日</Button>
                  <Button size="small" type="primary">
                    周
                  </Button>
                  <Button size="small">月</Button>
                </Space>
              </div>
              <div key={refreshKey} style={{ padding: '16px 0' }}>
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={78}
                    strokeColor={{
                      '0%': '#1890ff',
                      '100%': '#722ed1',
                    }}
                    format={(percent) => (
                      <span>
                        目标完成度: <Text strong>{percent}%</Text>
                      </span>
                    )}
                  />
                </div>
                <div className="mock-chart" key={refreshKey}>
                  {barHeights.map((height, index) => (
                    <div
                      key={index}
                      className="mock-bar"
                      style={{
                        height: `${height}px`,
                        background: `linear-gradient(180deg, #1890ff 0%, #722ed1 100%)`,
                      }}
                      title={`周一到周日: ${height}`}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: 8,
                    fontSize: 12,
                    color: '#999',
                  }}
                >
                  <span>周一</span>
                  <span>周二</span>
                  <span>周三</span>
                  <span>周四</span>
                  <span>周五</span>
                  <span>周六</span>
                  <span>周日</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="chart-container" style={{ height: '100%' }}>
              <div className="table-header">
                <div className="table-title">
                  <PieChartOutlined style={{ marginRight: 8 }} />
                  流量来源
                </div>
              </div>
              <div style={{ padding: '24px 0' }}>
                <div className="mock-pie" key={refreshKey} />
                <div className="pie-legend">
                  {pieLegend.map((item, index) => (
                    <div key={index} className="pie-legend-item">
                      <div
                        className="pie-legend-color"
                        style={{ background: item.color }}
                      />
                      <span>
                        {item.label} {item.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="table-container">
          <div className="table-header">
            <div className="table-title">
              <BarChartOutlined style={{ marginRight: 8 }} />
              热门页面排行
            </div>
            <Space>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'success', label: '正常' },
                  { value: 'warning', label: '警告' },
                  { value: 'error', label: '异常' },
                ]}
              />
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['5', '10', '20'],
              defaultPageSize: 5,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
