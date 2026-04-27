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
  Divider,
  Tabs,
  Empty,
  List,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  markAsRead,
  markAllAsRead,
  markAsHandled,
  setSelectedAlert,
} from '@/store/slices/alertsSlice';
import StatusTag from '@/components/StatusTag';
import type { Alert, AlertLevel } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const MessageAlerts = () => {
  const dispatch = useAppDispatch();
  const { list: alerts, unreadCount, selectedAlert, loading } = useAppSelector((state) => state.alerts);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<AlertLevel | undefined>();
  const [filterIsHandled, setFilterIsHandled] = useState<boolean | undefined>();

  const stats = useMemo(() => ({
    total: alerts.length,
    unread: unreadCount,
    unhandled: alerts.filter((a) => !a.isHandled).length,
    critical: alerts.filter((a) => a.level === 'critical').length,
    error: alerts.filter((a) => a.level === 'error').length,
    warning: alerts.filter((a) => a.level === 'warning').length,
    info: alerts.filter((a) => a.level === 'info').length,
  }), [alerts, unreadCount]);

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    if (activeTab === 'unread') {
      result = result.filter((a) => !a.isRead);
    } else if (activeTab === 'unhandled') {
      result = result.filter((a) => !a.isHandled);
    } else if (activeTab === 'critical') {
      result = result.filter((a) => a.level === 'critical');
    }

    if (filterLevel) {
      result = result.filter((a) => a.level === filterLevel);
    }

    if (filterIsHandled !== undefined) {
      result = result.filter((a) => a.isHandled === filterIsHandled);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter((a) =>
        a.title.toLowerCase().includes(lower) ||
        a.message.toLowerCase().includes(lower) ||
        a.type.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [alerts, activeTab, filterLevel, filterIsHandled, searchText]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
    message.success('已标记为已读');
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    message.success('已全部标记为已读');
  };

  const handleMarkAsHandled = (id: number) => {
    dispatch(markAsHandled({ id, handledBy: '当前用户' }));
    message.success('已标记为已处理');
  };

  const handleViewDetail = (alert: Alert) => {
    dispatch(setSelectedAlert(alert));
    setIsDrawerOpen(true);
  };

  const levelColors = {
    critical: '#ff4d4f',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',
  };

  const columns: ColumnsType<Alert> = [
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => (
        <Badge
          color={levelColors[level]}
          text={<StatusTag type="alert" status={level} />}
        />
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag>
          {type === 'vehicle_offline' ? '车辆离线' :
           type === 'trip_abnormal' ? '行程异常' :
           type === 'dispatch_timeout' ? '调度超时' :
           type === 'capacity_insufficient' ? '运力不足' :
           type === 'violation' ? '违规操作' : '系统'}
        </Tag>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title, record) => (
        <Space>
          {!record.isRead && <Badge dot />}
          <Text strong>{title}</Text>
        </Space>
      ),
    },
    {
      title: '消息内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message) => (
        <Text type="secondary">{message}</Text>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.isRead ? (
            <Tag color="default">已读</Tag>
          ) : (
            <Tag color="processing">未读</Tag>
          )}
          {record.isHandled ? (
            <Tag color="success">已处理</Tag>
          ) : (
            <Tag color="warning">待处理</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => (
        <Text type="secondary">
          {new Date(time).toLocaleString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {!record.isRead && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleMarkAsRead(record.id)}>
              标为已读
            </Button>
          )}
          {!record.isHandled && (
            <Popconfirm
              title="标记已处理"
              description="确定要标记此告警为已处理吗？"
              icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
              onConfirm={() => handleMarkAsHandled(record.id)}
            >
              <Button type="link" size="small" icon={<CheckCircleOutlined />}>
                处理
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="未读告警"
              value={stats.unread}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.unhandled}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="严重告警"
              value={stats.critical}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="总告警数"
              value={stats.total}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部告警 (${stats.total})`} key="all" />
          <TabPane tab={`未读告警 (${stats.unread})`} key="unread" />
          <TabPane tab={`待处理 (${stats.unhandled})`} key="unhandled" />
          <TabPane tab={`严重告警 (${stats.critical})`} key="critical" />
        </Tabs>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索告警标题、内容"
              allowClear
              style={{ width: 280 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="告警等级"
              allowClear
              style={{ width: 120 }}
              value={filterLevel}
              onChange={setFilterLevel}
            >
              <Option value="critical">严重</Option>
              <Option value="error">错误</Option>
              <Option value="warning">警告</Option>
              <Option value="info">信息</Option>
            </Select>
            <Select
              placeholder="处理状态"
              allowClear
              style={{ width: 120 }}
              value={filterIsHandled}
              onChange={setFilterIsHandled}
            >
              <Option value={true}>已处理</Option>
              <Option value={false}>待处理</Option>
            </Select>
          </Space>
          <Space>
            {stats.unread > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                全部标为已读
              </Button>
            )}
            <Button icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAlerts}
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
        title="告警详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedAlert && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="告警等级" span={2}>
                  <StatusTag type="alert" status={selectedAlert.level} />
                </Descriptions.Item>
                <Descriptions.Item label="告警类型">
                  <Tag>
                    {selectedAlert.type === 'vehicle_offline' ? '车辆离线' :
                     selectedAlert.type === 'trip_abnormal' ? '行程异常' :
                     selectedAlert.type === 'dispatch_timeout' ? '调度超时' :
                     selectedAlert.type === 'capacity_insufficient' ? '运力不足' :
                     selectedAlert.type === 'violation' ? '违规操作' : '系统'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="标题" span={2}>
                  <Text strong>{selectedAlert.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="消息内容" span={2}>
                  <Text>{selectedAlert.message}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="关联ID">
                  {selectedAlert.relatedId || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedAlert.createdAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="处理状态" style={{ marginTop: 16 }}>
              <List>
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge dot={!selectedAlert.isRead} />}
                    title="阅读状态"
                    description={selectedAlert.isRead ? '已读' : '未读'}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge dot={!selectedAlert.isHandled} />}
                    title="处理状态"
                    description={selectedAlert.isHandled ? '已处理' : '待处理'}
                  />
                </List.Item>
                {selectedAlert.isHandled && (
                  <>
                    <List.Item>
                      <List.Item.Meta
                        title="处理人"
                        description={selectedAlert.handledBy || '未知'}
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        title="处理时间"
                        description={selectedAlert.handledAt ? new Date(selectedAlert.handledAt).toLocaleString('zh-CN') : '未知'}
                      />
                    </List.Item>
                  </>
                )}
              </List>
            </Card>

            <Divider />

            <Space>
              {!selectedAlert.isRead && (
                <Button onClick={() => {
                  handleMarkAsRead(selectedAlert.id);
                  setIsDrawerOpen(false);
                }}>
                  标为已读
                </Button>
              )}
              {!selectedAlert.isHandled && (
                <Popconfirm
                  title="标记已处理"
                  description="确定要标记此告警为已处理吗？"
                  icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                  onConfirm={() => {
                    handleMarkAsHandled(selectedAlert.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  <Button type="primary">
                    标记已处理
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

export default MessageAlerts;
