import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Badge,
  Modal,
  Popconfirm,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Drawer,
  Descriptions,
  Progress,
  Divider,
  Tabs,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  CarOutlined,
  UserOutlined,
  WarningOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  updateTripStatus,
  markTripAbnormal,
  setSelectedTrip,
} from '@/store/slices/tripsSlice';
import StatusTag from '@/components/StatusTag';
import type { Trip, TripStatus } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const TripMonitoring = () => {
  const dispatch = useAppDispatch();
  const { list: trips, selectedTrip, loading } = useAppSelector((state) => state.trips);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchText, setSearchText] = useState('');

  const stats = useMemo(() => ({
    total: trips.length,
    inProgress: trips.filter((t) => t.status === 'in_progress').length,
    completed: trips.filter((t) => t.status === 'completed').length,
    abnormal: trips.filter((t) => t.isAbnormal).length,
  }), [trips]);

  const filteredTrips = useMemo(() => {
    let result = trips;

    if (activeTab === 'inProgress') {
      result = result.filter((t) => t.status === 'in_progress');
    } else if (activeTab === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    } else if (activeTab === 'abnormal') {
      result = result.filter((t) => t.isAbnormal);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter((t) =>
        t.dispatchNumber.toLowerCase().includes(lower) ||
        t.origin.toLowerCase().includes(lower) ||
        t.destination.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [trips, activeTab, searchText]);

  const handleStatusChange = (id: number, status: TripStatus) => {
    dispatch(updateTripStatus({ id, status }));
    message.success('行程状态已更新');
  };

  const handleMarkAbnormal = (id: number, isAbnormal: boolean) => {
    dispatch(markTripAbnormal({ id, isAbnormal }));
    message.success(isAbnormal ? '行程已标记为异常' : '行程异常标记已取消');
  };

  const handleViewDetail = (trip: Trip) => {
    dispatch(setSelectedTrip(trip));
    setIsDrawerOpen(true);
  };

  const columns: ColumnsType<Trip> = [
    {
      title: '调度编号',
      dataIndex: 'dispatchNumber',
      key: 'dispatchNumber',
      width: 140,
      render: (text) => <Text type="secondary" code>{text}</Text>,
    },
    {
      title: '行程信息',
      key: 'tripInfo',
      width: 280,
      render: (_, record) => (
        <div>
          <Text strong>{record.origin}</Text>
          <Text type="secondary" style={{ margin: '0 8px' }}>→</Text>
          <Text strong>{record.destination}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前速度: {record.currentSpeed} km/h | 预计到达: {new Date(record.estimatedArrival).toLocaleTimeString('zh-CN')}
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ lineHeight: 1.5 }}>
          <StatusTag type="trip" status={record.status} />
          {record.isAbnormal && (
            <Tag color="red" icon={<WarningOutlined />} style={{ margin: 0 }}>
              {record.abnormalReason || '异常'}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '路况',
      dataIndex: 'trafficStatus',
      key: 'trafficStatus',
      width: 100,
      render: (status) => (
        <Tag color={
          status === 'smooth' ? 'success' :
          status === 'moderate' ? 'warning' : 'error'
        }>
          {status === 'smooth' ? '畅通' : status === 'moderate' ? '缓行' : '拥堵'}
        </Tag>
      ),
    },
    {
      title: '行程进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const progress = Math.min(100, Math.round((record.route.length / 10) * 100));
        return (
          <Progress
            percent={progress}
            size="small"
            strokeColor={record.isAbnormal ? '#ff4d4f' : '#52c41a'}
          />
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'in_progress' && (
            <>
              <Popconfirm
                title={record.isAbnormal ? '取消异常标记' : '标记异常'}
                description={record.isAbnormal ? '确定要取消此行程的异常标记吗？' : '确定要标记此行程为异常吗？'}
                icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                onConfirm={() => handleMarkAbnormal(record.id, !record.isAbnormal)}
              >
                <Button type="link" size="small" danger={record.isAbnormal}>
                  {record.isAbnormal ? '取消异常' : '标记异常'}
                </Button>
              </Popconfirm>
              {!record.isAbnormal && (
                <Popconfirm
                  title="暂停行程"
                  description="确定要暂停此行程吗？"
                  icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                  onConfirm={() => handleStatusChange(record.id, 'pending')}
                >
                  <Button type="link" size="small" icon={<PauseCircleOutlined />}>
                    暂停
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="总行程数"
              value={stats.total}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="异常行程"
              value={stats.abnormal}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部行程 (${stats.total})`} key="all" />
          <TabPane tab={`进行中 (${stats.inProgress})`} key="inProgress" />
          <TabPane tab={`已完成 (${stats.completed})`} key="completed" />
          <TabPane tab={`异常行程 (${stats.abnormal})`} key="abnormal" />
        </Tabs>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索调度编号、起点、终点"
              allowClear
              style={{ width: 280 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Button
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '暂停回放' : '开始回放'}
            </Button>
            <Button icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTrips}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title="行程详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedTrip && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="调度编号" span={2}>
                  <Text code style={{ fontSize: 16 }}>{selectedTrip.dispatchNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="行程状态">
                  <StatusTag type="trip" status={selectedTrip.status} />
                </Descriptions.Item>
                <Descriptions.Item label="异常状态">
                  {selectedTrip.isAbnormal ? (
                    <Tag color="red" icon={<WarningOutlined />}>
                      {selectedTrip.abnormalReason || '异常'}
                    </Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="起点" span={2}>
                  {selectedTrip.origin}
                </Descriptions.Item>
                <Descriptions.Item label="终点" span={2}>
                  {selectedTrip.destination}
                </Descriptions.Item>
                <Descriptions.Item label="当前速度">
                  {selectedTrip.currentSpeed} km/h
                </Descriptions.Item>
                <Descriptions.Item label="预计到达">
                  {new Date(selectedTrip.estimatedArrival).toLocaleTimeString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="行驶时长">
                  {selectedTrip.travelTime} 分钟
                </Descriptions.Item>
                <Descriptions.Item label="路况">
                  <Tag color={
                    selectedTrip.trafficStatus === 'smooth' ? 'success' :
                    selectedTrip.trafficStatus === 'moderate' ? 'warning' : 'error'
                  }>
                    {selectedTrip.trafficStatus === 'smooth' ? '畅通' : selectedTrip.trafficStatus === 'moderate' ? '缓行' : '拥堵'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="行程进度" style={{ marginTop: 16 }}>
              <Progress
                percent={Math.min(100, Math.round((selectedTrip.route.length / 10) * 100))}
                strokeColor={selectedTrip.isAbnormal ? '#ff4d4f' : '#52c41a'}
                size="large"
              />
            </Card>

            <Card type="inner" title="行程事件" style={{ marginTop: 16 }}>
              <Timeline>
                {selectedTrip.events.map((event) => (
                  <Timeline.Item
                    key={event.id}
                    color={
                      event.type === 'abnormal' ? 'red' :
                      event.type === 'end' ? 'green' : 'blue'
                    }
                  >
                    <Text strong>{event.description}</Text>
                    <br />
                    <Text type="secondary">{new Date(event.time).toLocaleString('zh-CN')}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Divider />

            <Space>
              {selectedTrip.status === 'in_progress' && !selectedTrip.isAbnormal && (
                <Popconfirm
                  title="标记异常"
                  description="确定要标记此行程为异常吗？"
                  icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                  onConfirm={() => {
                    handleMarkAbnormal(selectedTrip.id, true);
                    setIsDrawerOpen(false);
                  }}
                >
                  <Button danger>
                    标记异常
                  </Button>
                </Popconfirm>
              )}
              {selectedTrip.isAbnormal && (
                <Popconfirm
                  title="取消异常标记"
                  description="确定要取消此行程的异常标记吗？"
                  icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                  onConfirm={() => {
                    handleMarkAbnormal(selectedTrip.id, false);
                    setIsDrawerOpen(false);
                  }}
                >
                  <Button>
                    取消异常标记
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TripMonitoring;
