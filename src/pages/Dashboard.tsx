import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Tabs, Button, Space, Select, Badge, Tag, Typography, List, Avatar, Statistic } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  FileTextOutlined,
  WarningOutlined,
  BellOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '@/store';
import StatCard from '@/components/StatCard';
import SimulatedMap from '@/components/SimulatedMap';
import StatusTag from '@/components/StatusTag';
import type { Vehicle, Order, Alert } from '@/types';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const { list: vehicles, selectedVehicle } = useAppSelector((state) => state.vehicles);
  const { list: orders } = useAppSelector((state) => state.orders);
  const { list: alerts, unreadCount } = useAppSelector((state) => state.alerts);

  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const stats = useMemo(() => {
    const onlineVehicles = vehicles.filter((v) => v.status === 'online').length;
    const idleVehicles = vehicles.filter((v) => v.operationalStatus === 'idle' && v.status === 'online').length;
    const operatingVehicles = vehicles.filter((v) => v.operationalStatus === 'operating').length;
    const offlineVehicles = vehicles.filter((v) => v.status !== 'online').length;

    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'assigned').length;
    const operatingOrders = orders.filter((o) => o.status === 'in_trip' || o.status === 'accepted').length;
    const urgentOrders = orders.filter((o) => o.isUrgent).length;
    const timeoutOrders = orders.filter((o) => o.isTimeout).length;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;

    return {
      onlineVehicles,
      idleVehicles,
      operatingVehicles,
      offlineVehicles,
      totalVehicles: vehicles.length,
      pendingOrders,
      operatingOrders,
      urgentOrders,
      timeoutOrders,
      totalOrders,
      completedOrders,
    };
  }, [vehicles, orders]);

  const heatAreas = useMemo(() => {
    const areaCounts: Record<string, number> = {};
    vehicles.forEach((v) => {
      areaCounts[v.area] = (areaCounts[v.area] || 0) + 1;
    });
    
    return Object.entries(areaCounts).map(([name, count], index) => ({
      name,
      count,
      x: 20 + (index * 15) % 60,
      y: 20 + (index * 20) % 50,
    }));
  }, [vehicles]);

  const recentOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'pending' || o.status === 'assigned')
      .slice(0, 10)
      .sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return 0;
      });
  }, [orders]);

  const recentAlerts = useMemo(() => {
    return alerts
      .filter((a) => !a.isHandled)
      .slice(0, 8);
  }, [alerts]);

  const vehicleColumns: ColumnsType<Vehicle> = [
    {
      title: '车牌',
      dataIndex: 'plate',
      key: 'plate',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="vehicle" status={status} />,
    },
    {
      title: '营运状态',
      dataIndex: 'operationalStatus',
      key: 'operationalStatus',
      render: (status) => <StatusTag type="operational" status={status} />,
    },
    {
      title: '区域',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '续航',
      dataIndex: 'battery',
      key: 'battery',
      render: (value) => (
        <Tag color={value > 50 ? 'success' : value > 20 ? 'warning' : 'error'}>
          {value}%
        </Tag>
      ),
    },
    {
      title: '异常',
      dataIndex: 'isAbnormal',
      key: 'isAbnormal',
      render: (isAbnormal) => isAbnormal ? (
        <Badge status="error" text="异常" />
      ) : (
        <Badge status="success" text="正常" />
      ),
    },
  ];

  const orderColumns: ColumnsType<Order> = [
    {
      title: '调度编号',
      dataIndex: 'dispatchNumber',
      key: 'dispatchNumber',
      render: (text) => <Text type="secondary" code>{text}</Text>,
    },
    {
      title: '出发地',
      dataIndex: 'origin',
      key: 'origin',
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority, record) => (
        <Space>
          <StatusTag type="priority" status={priority} />
          {record.isUrgent && <Tag color="red" icon={<WarningOutlined />}>紧急</Tag>}
          {record.isTimeout && <Tag color="orange">超时</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="order" status={status} />,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small">派单</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="在线车辆"
            value={stats.onlineVehicles}
            suffix={`/ ${stats.totalVehicles}`}
            icon={<CarOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
            color="#52c41a"
            trend="up"
            trendValue="+12%"
            progress={(stats.onlineVehicles / stats.totalVehicles) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="空闲车辆"
            value={stats.idleVehicles}
            icon={<CarOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
            warning={stats.idleVehicles < 5}
            warningMessage="空闲车辆不足"
            progress={(stats.idleVehicles / stats.onlineVehicles) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="待派订单"
            value={stats.pendingOrders}
            icon={<FileTextOutlined style={{ fontSize: 24, color: '#faad14' }} />}
            color="#faad14"
            warning={stats.pendingOrders > 10}
            warningMessage="待派单量过高"
            trend={stats.pendingOrders > 5 ? 'up' : 'down'}
            trendValue={stats.pendingOrders > 5 ? '+5%' : '-3%'}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="未处理告警"
            value={unreadCount}
            icon={<BellOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
            color="#ff4d4f"
            warning={unreadCount > 0}
            warningMessage="存在未处理告警"
          />
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="调度总览" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="车辆点位图" extra={
                <Select
                  value={selectedArea}
                  onChange={setSelectedArea}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="all">全部区域</Option>
                  {['朝阳区', '海淀区', '东城区', '西城区', '丰台区'].map((area) => (
                    <Option key={area} value={area}>{area}</Option>
                  ))}
                </Select>
              }>
                <SimulatedMap
                  vehicles={vehicles}
                  heatAreas={heatAreas}
                  showHeatMap
                  selectedVehicleId={selectedVehicle?.id}
                  width={760}
                  height={400}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="实时订单滚动栏" extra={
                <Button type="link" size="small">查看全部</Button>
              }>
                <div className="order-scroll" style={{ maxHeight: 400 }}>
                  <List
                    dataSource={recentOrders}
                    renderItem={(order) => (
                      <List.Item
                        actions={[
                          <Button type="link" size="small">派单</Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor: order.isUrgent ? '#ff4d4f' : order.isTimeout ? '#faad14' : '#1890ff',
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
                            <Space size="small">
                              <Text type="secondary">{order.dispatchNumber}</Text>
                              <StatusTag type="priority" status={order.priority} />
                              {order.isUrgent && <Tag color="red">紧急</Tag>}
                              {order.isTimeout && <Tag color="orange">超时{order.timeoutMinutes}分钟</Tag>}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <Card title="车辆状态概览" extra={
                <Space>
                  <Tag icon={<ArrowUpOutlined />} color="success">在线: {stats.onlineVehicles}</Tag>
                  <Tag icon={<ArrowDownOutlined />} color="error">离线: {stats.offlineVehicles}</Tag>
                  <Tag color="processing">空闲: {stats.idleVehicles}</Tag>
                  <Tag color="success">营运: {stats.operatingVehicles}</Tag>
                </Space>
              }>
                <Table
                  columns={vehicleColumns}
                  dataSource={vehicles.slice(0, 8)}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="消息告警" extra={
                <Badge count={unreadCount} showZero>
                  <Button type="link" size="small" onClick={() => navigate('/alerts')}>查看全部</Button>
                </Badge>
              }>
                <div className="order-scroll" style={{ maxHeight: 400 }}>
                  <List
                    dataSource={recentAlerts}
                    renderItem={(alert) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor: 
                                  alert.level === 'critical' || alert.level === 'error' ? '#ff4d4f' :
                                  alert.level === 'warning' ? '#faad14' : '#1890ff',
                              }}
                              icon={<WarningOutlined />}
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{alert.title}</Text>
                              {!alert.isRead && <Badge dot />}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{alert.message}</Text>
                              <StatusTag type="alert" status={alert.level} />
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="实时数据" key="realtime">
          <Card title="订单实时列表">
            <Table
              columns={orderColumns}
              dataSource={orders.filter((o) => 
                o.status === 'pending' || o.status === 'assigned' || o.status === 'in_trip'
              )}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="区域运力" key="area">
          <Row gutter={[16, 16]}>
            {heatAreas.map((area) => (
              <Col xs={24} sm={12} md={8} lg={6} key={area.name}>
                <Card>
                  <Statistic
                    title={area.name}
                    value={area.count}
                    suffix="辆车"
                    valueStyle={{ color: area.count > 5 ? '#52c41a' : area.count > 2 ? '#faad14' : '#ff4d4f' }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">运力负荷: </Text>
                    <Tag color={area.count > 5 ? 'success' : area.count > 2 ? 'warning' : 'error'}>
                      {area.count > 5 ? '充足' : area.count > 2 ? '一般' : '不足'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;
