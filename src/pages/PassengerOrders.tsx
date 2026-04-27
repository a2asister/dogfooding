import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Popconfirm,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Drawer,
  Descriptions,
  Divider,
  Tabs,
  List,
  Avatar,
  Badge,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  FileTextOutlined,
  WarningOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  setFilters,
  setSelectedPassenger,
  lockPassengerOrder,
} from '@/store/slices/reportSlice';
import StatCard from '@/components/StatCard';
import type { Passenger } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

const PassengerOrders = () => {
  const dispatch = useAppDispatch();
  const { passengers, filters, selectedPassenger } = useAppSelector((state) => state.report);
  const { list: orders } = useAppSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [selectedPassengerForLock, setSelectedPassengerForLock] = useState<Passenger | null>(null);

  const stats = useMemo(() => ({
    total: passengers.length,
    withComplaints: passengers.filter((p) => p.hasComplaints).length,
    highRating: passengers.filter((p) => p.rating >= 4.5).length,
    totalOrders: passengers.reduce((sum, p) => sum + p.totalOrders, 0),
  }), [passengers]);

  const filteredPassengers = useMemo(() => {
    return passengers.filter((passenger) => {
      if (activeTab === 'complaints' && !passenger.hasComplaints) return false;
      if (activeTab === 'highRating' && passenger.rating < 4.5) return false;

      if (filters.hasComplaints && !passenger.hasComplaints) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          passenger.name.toLowerCase().includes(searchLower) ||
          passenger.phone.includes(filters.search)
        );
      }
      return true;
    });
  }, [passengers, filters, activeTab]);

  const passengerOrders = useMemo(() => {
    if (!selectedPassenger) return [];
    return orders.filter((o) => o.passengerName === selectedPassenger.name);
  }, [selectedPassenger, orders]);

  const handleViewDetail = (passenger: Passenger) => {
    dispatch(setSelectedPassenger(passenger));
    setIsDrawerOpen(true);
  };

  const handleLockPassenger = (passenger: Passenger) => {
    setSelectedPassengerForLock(passenger);
    setIsLockModalOpen(true);
  };

  const handleConfirmLock = () => {
    if (selectedPassengerForLock) {
      dispatch(lockPassengerOrder({
        passengerId: selectedPassengerForLock.id,
        isLocked: !selectedPassengerForLock.hasComplaints,
      }));
      message.success(
        selectedPassengerForLock.hasComplaints
          ? '乘客已解锁'
          : '乘客已锁定，存在投诉记录'
      );
      setIsLockModalOpen(false);
    }
  };

  const columns: ColumnsType<Passenger> = [
    {
      title: '乘客信息',
      key: 'passenger',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      render: (value) => (
        <Tag color="blue">{value} 单</Tag>
      ),
    },
    {
      title: '消费总额',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (value) => (
        <Text strong>¥{value.toLocaleString()}</Text>
      ),
    },
    {
      title: '服务评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (value) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text strong style={{ color: value >= 4.5 ? '#52c41a' : value >= 3.5 ? '#faad14' : '#ff4d4f' }}>
            {value.toFixed(1)}
          </Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'hasComplaints',
      key: 'hasComplaints',
      render: (hasComplaints) => (
        hasComplaints ? (
          <Badge status="error" text="有投诉" />
        ) : (
          <Badge status="success" text="正常" />
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Popconfirm
            title={record.hasComplaints ? '解锁乘客' : '锁定乘客'}
            description={record.hasComplaints ? '确定要解锁此乘客吗？' : '确定要锁定此乘客的订单吗？'}
            onConfirm={() => handleLockPassenger(record)}
          >
            <Button
              type="link"
              size="small"
              danger={!record.hasComplaints}
              icon={record.hasComplaints ? <UnlockOutlined /> : <LockOutlined />}
            >
              {record.hasComplaints ? '解锁' : '锁定'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="总乘客数"
            value={stats.total}
            suffix="人"
            icon={<UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="有投诉记录"
            value={stats.withComplaints}
            suffix="人"
            icon={<WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
            color="#ff4d4f"
            warning={stats.withComplaints > 0}
            warningMessage="存在投诉记录需要处理"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="高评分乘客"
            value={stats.highRating}
            suffix="人"
            icon={<StarOutlined style={{ fontSize: 24, color: '#faad14' }} />}
            color="#faad14"
            progress={(stats.highRating / stats.total) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="总订单数"
            value={stats.totalOrders}
            suffix="单"
            icon={<FileTextOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部乘客 (${stats.total})`} key="all" />
          <TabPane tab={`有投诉 (${stats.withComplaints})`} key="complaints" />
          <TabPane tab={`高评分 (${stats.highRating})`} key="highRating" />
        </Tabs>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索乘客姓名、手机号"
              allowClear
              style={{ width: 280 }}
              onSearch={(value) => dispatch(setFilters({ search: value }))}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="投诉状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ hasComplaints: value }))}
            >
              <Option value={true}>有投诉</Option>
              <Option value={false}>无投诉</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ClockCircleOutlined />}>历史记录</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPassengers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Drawer
        title="乘客详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedPassenger && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="乘客姓名">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>{selectedPassenger.name}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {selectedPassenger.phone}
                </Descriptions.Item>
                <Descriptions.Item label="订单总数">
                  <Tag color="blue">{selectedPassenger.totalOrders} 单</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="消费总额">
                  <Text strong>¥{selectedPassenger.totalSpent.toLocaleString()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="服务评分" span={2}>
                  <Space>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarOutlined
                        key={star}
                        style={{
                          color: star <= Math.floor(selectedPassenger.rating) ? '#faad14' : '#d9d9d9',
                          fontSize: 18,
                        }}
                      />
                    ))}
                    <Text strong style={{ marginLeft: 8 }}>
                      {selectedPassenger.rating.toFixed(1)} / 5.0
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="投诉状态" span={2}>
                  {selectedPassenger.hasComplaints ? (
                    <Tag color="error" icon={<WarningOutlined />}>
                      存在未处理投诉
                    </Tag>
                  ) : (
                    <Tag color="success">无投诉记录</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card
              type="inner"
              title="历史订单"
              extra={
                <Text type="secondary">共 {passengerOrders.length} 单</Text>
              }
            >
              <List
                dataSource={passengerOrders}
                locale={{ emptyText: '暂无订单记录' }}
                renderItem={(order) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看详情</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: order.status === 'completed' ? '#52c41a' : order.status === 'cancelled' ? '#ff4d4f' : '#1890ff',
                          }}
                          icon={<FileTextOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{order.origin}</Text>
                          <Text type="secondary">→</Text>
                          <Text strong>{order.destination}</Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            调度编号: {order.dispatchNumber}
                          </Text>
                          <Space size="small">
                            <Text type="secondary">
                              行程: {order.distance}km
                            </Text>
                            <Text type="secondary">
                              费用: ¥{order.estimatedCost}
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {selectedPassenger.hasComplaints && (
              <>
                <Divider />
                <Card type="inner" title="投诉记录" style={{ borderColor: '#ff4d4f' }}>
                  <Timeline mode="left">
                    <Timeline.Item color="red">
                      <Text strong>投诉提交</Text>
                      <br />
                      <Text type="secondary">2024-01-15 14:30</Text>
                      <br />
                      <Text>司机服务态度差，绕路</Text>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Text strong>客服介入</Text>
                      <br />
                      <Text type="secondary">2024-01-15 15:00</Text>
                      <br />
                      <Text>已联系司机核实情况</Text>
                    </Timeline.Item>
                  </Timeline>
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Space>
                      <Button>处理中</Button>
                      <Button type="primary">标记已解决</Button>
                    </Space>
                  </div>
                </Card>
              </>
            )}

            <Divider />

            <Space>
              <Button
                danger={!selectedPassenger.hasComplaints}
                icon={selectedPassenger.hasComplaints ? <UnlockOutlined /> : <LockOutlined />}
                onClick={() => handleLockPassenger(selectedPassenger)}
              >
                {selectedPassenger.hasComplaints ? '解锁乘客' : '锁定乘客'}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title={selectedPassengerForLock?.hasComplaints ? '确认解锁' : '确认锁定'}
        open={isLockModalOpen}
        onCancel={() => setIsLockModalOpen(false)}
        onOk={handleConfirmLock}
        okText="确认"
        cancelText="取消"
      >
        {selectedPassengerForLock?.hasComplaints ? (
          <div>
            <p>确定要解锁乘客 <Text strong>{selectedPassengerForLock.name}</Text> 吗？</p>
            <p>解锁后该乘客可以正常下单。</p>
          </div>
        ) : (
          <div>
            <p>确定要锁定乘客 <Text strong>{selectedPassengerForLock?.name}</Text> 吗？</p>
            <p>锁定后该乘客的订单将被标记为异常，需要人工审核。</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PassengerOrders;
