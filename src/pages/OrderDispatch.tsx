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
  Form,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip,
  message,
  Typography,
  Drawer,
  Descriptions,
  Divider,
  Tabs,
  Radio,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WarningOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  CarOutlined,
  UserOutlined,
  SyncOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  assignOrder,
  reassignOrder,
  setOrderUrgent,
  setOrderTimeout,
  updateOrderStatus,
  setSelectedOrder,
  setFilters,
} from '@/store/slices/ordersSlice';
import StatusTag from '@/components/StatusTag';
import type { Order, OrderStatus, OrderPriority, Vehicle, Driver } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { RadioGroup } = Radio;

const OrderDispatch = () => {
  const dispatch = useAppDispatch();
  const { list: orders, filters, selectedOrder, loading } = useAppSelector((state) => state.orders);
  const { list: vehicles } = useAppSelector((state) => state.vehicles);
  const { list: drivers } = useAppSelector((state) => state.drivers);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [dispatchType, setDispatchType] = useState<'manual' | 'auto'>('manual');
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    assigned: orders.filter((o) => o.status === 'assigned').length,
    inTrip: orders.filter((o) => o.status === 'in_trip').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    urgent: orders.filter((o) => o.isUrgent).length,
    timeout: orders.filter((o) => o.isTimeout).length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab === 'pending') {
      result = result.filter((o) => o.status === 'pending');
    } else if (activeTab === 'operating') {
      result = result.filter((o) => o.status === 'assigned' || o.status === 'in_trip');
    } else if (activeTab === 'completed') {
      result = result.filter((o) => o.status === 'completed' || o.status === 'cancelled');
    } else if (activeTab === 'urgent') {
      result = result.filter((o) => o.isUrgent);
    } else if (activeTab === 'timeout') {
      result = result.filter((o) => o.isTimeout);
    }

    return result.filter((order) => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.priority && order.priority !== filters.priority) return false;
      if (filters.isUrgent && !order.isUrgent) return false;
      if (filters.isTimeout && !order.isTimeout) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          order.dispatchNumber.toLowerCase().includes(searchLower) ||
          order.origin.toLowerCase().includes(searchLower) ||
          order.destination.toLowerCase().includes(searchLower) ||
          order.passengerName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [orders, filters, activeTab]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'online' && v.operationalStatus === 'idle');
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter((d) => d.status === 'on duty');
  }, [drivers]);

  const handleDispatch = (orderId: number, vehicleId: number, driverId: number) => {
    dispatch(assignOrder({ id: orderId, vehicleId, driverId }));
    message.success('派单成功！');
    setIsDispatchModalOpen(false);
  };

  const handleReassign = (orderId: number, vehicleId: number, driverId: number) => {
    dispatch(reassignOrder({ id: orderId, vehicleId, driverId }));
    message.success('改派成功！');
    setIsReassignModalOpen(false);
  };

  const handleSetUrgent = (orderId: number, isUrgent: boolean) => {
    dispatch(setOrderUrgent({ id: orderId, isUrgent }));
    message.success(isUrgent ? '订单已设为紧急' : '订单紧急状态已取消');
    setIsUrgentModalOpen(false);
  };

  const handleUpdateStatus = (orderId: number, status: OrderStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
    message.success('订单状态已更新');
  };

  const handleViewDetail = (order: Order) => {
    dispatch(setSelectedOrder(order));
    setIsDrawerOpen(true);
  };

  const handleAutoDispatch = (orderId: number) => {
    if (availableVehicles.length > 0 && availableDrivers.length > 0) {
      const vehicle = availableVehicles[0];
      const driver = availableDrivers[0];
      dispatch(assignOrder({ id: orderId, vehicleId: vehicle.id, driverId: driver.id }));
      message.success('智能派单成功！');
    } else {
      message.warning('没有可用的车辆或司机');
    }
  };

  const handleBatchDispatch = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择订单');
      return;
    }
    message.success(`已对 ${selectedRowKeys.length} 个订单执行派单操作`);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<Order> = [
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
            距离: {record.distance}km | 预估费用: ¥{record.estimatedCost}
          </Text>
        </div>
      ),
    },
    {
      title: '乘客信息',
      key: 'passenger',
      width: 120,
      render: (_, record) => (
        <div>
          <Text>{record.passengerName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.passengerPhone}</Text>
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 160,
      render: (priority, record) => (
        <Space direction="vertical" size="small" style={{ lineHeight: 1.5 }}>
          <StatusTag type="priority" status={priority} />
          {record.isUrgent && (
            <Tag color="red" icon={<ArrowUpOutlined />} style={{ margin: 0 }}>紧急</Tag>
          )}
          {record.isTimeout && (
            <Tag color="orange" icon={<WarningOutlined />} style={{ margin: 0 }}>
              超时{record.timeoutMinutes}分钟
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag type="order" status={status} />,
    },
    {
      title: '指派信息',
      key: 'assignment',
      width: 120,
      render: (_, record) => (
        <div>
          {record.assignedVehicleId ? (
            <div>
              <Text><CarOutlined /> 车辆 #{record.assignedVehicleId}</Text>
              <br />
              {record.assignedDriverId && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <UserOutlined /> 司机 #{record.assignedDriverId}
                </Text>
              )}
            </div>
          ) : (
            <Tag color="default">未派单</Tag>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => {
                setEditingOrder(record);
                setDispatchType('manual');
                setIsDispatchModalOpen(true);
              }}>
                人工派单
              </Button>
              <Button type="link" size="small" icon={<SyncOutlined />} onClick={() => handleAutoDispatch(record.id)}>
                智能派单
              </Button>
              <Popconfirm
                title="设为紧急"
                description="确定要将此订单设为紧急吗？"
                icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                onConfirm={() => handleSetUrgent(record.id, !record.isUrgent)}
              >
                <Button type="link" size="small" danger={record.isUrgent}>
                  {record.isUrgent ? '取消紧急' : '设为紧急'}
                </Button>
              </Popconfirm>
            </>
          )}
          {(record.status === 'assigned' || record.status === 'in_trip') && (
            <Button type="link" size="small" onClick={() => {
              setEditingOrder(record);
              setIsReassignModalOpen(true);
            }}>
              改派
            </Button>
          )}
          {record.status === 'pending' && (
            <Popconfirm
              title="取消订单"
              description="确定要取消此订单吗？"
              icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-error)' }} />}
              onConfirm={() => handleUpdateStatus(record.id, 'cancelled')}
            >
              <Button type="link" size="small" danger>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: Order) => ({
      disabled: record.status !== 'pending',
    }),
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="待派订单"
              value={stats.pending}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="营运中"
              value={stats.assigned + stats.inTrip}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="紧急订单"
              value={stats.urgent}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="超时订单"
              value={stats.timeout}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部订单 (${stats.total})`} key="all" />
          <TabPane tab={`待派单 (${stats.pending})`} key="pending" />
          <TabPane tab={`营运中 (${stats.assigned + stats.inTrip})`} key="operating" />
          <TabPane tab={`已完成 (${stats.completed})`} key="completed" />
          <TabPane tab={`紧急订单 (${stats.urgent})`} key="urgent" />
          <TabPane tab={`超时订单 (${stats.timeout})`} key="timeout" />
        </Tabs>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索订单号、起点、终点、乘客名"
              allowClear
              style={{ width: 280 }}
              onSearch={(value) => dispatch(setFilters({ search: value }))}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <Option value="pending">待派单</Option>
              <Option value="assigned">已派单</Option>
              <Option value="in_trip">营运中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <Select
              placeholder="优先级"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ priority: value }))}
            >
              <Option value="high">高优先级</Option>
              <Option value="medium">中优先级</Option>
              <Option value="low">低优先级</Option>
            </Select>
          </Space>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 个订单</Text>
                <Button type="primary" onClick={handleBatchDispatch}>
                  批量派单
                </Button>
              </Space>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => dispatch(setFilters({}))}>
              重置筛选
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Drawer
        title="订单详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedOrder && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="调度编号" span={2}>
                  <Text code style={{ fontSize: 16 }}>{selectedOrder.dispatchNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="订单状态">
                  <StatusTag type="order" status={selectedOrder.status} />
                </Descriptions.Item>
                <Descriptions.Item label="优先级">
                  <StatusTag type="priority" status={selectedOrder.priority} />
                </Descriptions.Item>
                <Descriptions.Item label="出发地" span={2}>
                  {selectedOrder.origin}
                </Descriptions.Item>
                <Descriptions.Item label="目的地" span={2}>
                  {selectedOrder.destination}
                </Descriptions.Item>
                <Descriptions.Item label="行程距离">
                  {selectedOrder.distance} km
                </Descriptions.Item>
                <Descriptions.Item label="预估费用">
                  ¥{selectedOrder.estimatedCost}
                </Descriptions.Item>
                <Descriptions.Item label="是否紧急">
                  {selectedOrder.isUrgent ? (
                    <Tag color="red">是</Tag>
                  ) : (
                    <Tag color="default">否</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="是否超时">
                  {selectedOrder.isTimeout ? (
                    <Tag color="orange">是 ({selectedOrder.timeoutMinutes}分钟)</Tag>
                  ) : (
                    <Tag color="default">否</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="乘客信息" style={{ marginTop: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="乘客姓名">
                  {selectedOrder.passengerName}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {selectedOrder.passengerPhone}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="指派信息" style={{ marginTop: 16 }}>
              {selectedOrder.assignedVehicleId ? (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="指派车辆">
                    车辆 #{selectedOrder.assignedVehicleId}
                  </Descriptions.Item>
                  <Descriptions.Item label="指派司机">
                    {selectedOrder.assignedDriverId ? `司机 #${selectedOrder.assignedDriverId}` : '未指派'}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">尚未派单</Text>
              )}
            </Card>

            <Card type="inner" title="时间线" style={{ marginTop: 16 }}>
              <div className="timeline-item">
                <Text strong>订单创建</Text>
                <br />
                <Text type="secondary">{new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}</Text>
              </div>
              {selectedOrder.acceptedAt && (
                <div className="timeline-item">
                  <Text strong>司机接单</Text>
                  <br />
                  <Text type="secondary">{new Date(selectedOrder.acceptedAt).toLocaleString('zh-CN')}</Text>
                </div>
              )}
              {selectedOrder.completedAt && (
                <div className="timeline-item">
                  <Text strong>订单完成</Text>
                  <br />
                  <Text type="secondary">{new Date(selectedOrder.completedAt).toLocaleString('zh-CN')}</Text>
                </div>
              )}
              {selectedOrder.cancelledAt && (
                <div className="timeline-item">
                  <Text strong>订单取消</Text>
                  <br />
                  <Text type="secondary">{new Date(selectedOrder.cancelledAt).toLocaleString('zh-CN')}</Text>
                </div>
              )}
            </Card>

            <Divider />

            <Space>
              {selectedOrder.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditingOrder(selectedOrder);
                      setDispatchType('manual');
                      setIsDispatchModalOpen(true);
                      setIsDrawerOpen(false);
                    }}
                  >
                    人工派单
                  </Button>
                  <Button onClick={() => handleAutoDispatch(selectedOrder.id)}>
                    智能派单
                  </Button>
                </>
              )}
              {(selectedOrder.status === 'assigned' || selectedOrder.status === 'in_trip') && (
                <Button onClick={() => {
                  setEditingOrder(selectedOrder);
                  setIsReassignModalOpen(true);
                  setIsDrawerOpen(false);
                }}>
                  改派订单
                </Button>
              )}
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title="派单"
        open={isDispatchModalOpen}
        onCancel={() => setIsDispatchModalOpen(false)}
        onOk={() => {
          form.validateFields().then((values) => {
            if (editingOrder) {
              if (dispatchType === 'auto') {
                handleAutoDispatch(editingOrder.id);
              } else {
                handleDispatch(editingOrder.id, values.vehicleId, values.driverId);
              }
            }
          });
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="派单方式">
            <RadioGroup value={dispatchType} onChange={(e) => setDispatchType(e.target.value)}>
              <Radio value="manual">人工选择</Radio>
              <Radio value="auto">智能派单</Radio>
            </RadioGroup>
          </Form.Item>

          {dispatchType === 'manual' && (
            <>
              <Form.Item
                name="vehicleId"
                label="选择车辆"
                rules={[{ required: true, message: '请选择车辆' }]}
              >
                <Select placeholder="请选择空闲车辆">
                  {availableVehicles.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.area} - 续航 {vehicle.battery}%
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="driverId"
                label="选择司机"
                rules={[{ required: true, message: '请选择司机' }]}
              >
                <Select placeholder="请选择在岗司机">
                  {availableDrivers.map((driver) => (
                    <Option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.shift} - 评分 {driver.rating}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {dispatchType === 'auto' && (
            <div className="alert-info">
              系统将根据距离、评分、区域等因素自动匹配最优的车辆和司机。
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        title="改派订单"
        open={isReassignModalOpen}
        onCancel={() => setIsReassignModalOpen(false)}
        onOk={() => {
          form.validateFields().then((values) => {
            if (editingOrder) {
              handleReassign(editingOrder.id, values.vehicleId, values.driverId);
            }
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="选择车辆"
            rules={[{ required: true, message: '请选择车辆' }]}
          >
            <Select placeholder="请选择空闲车辆">
              {availableVehicles.map((vehicle) => (
                <Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.area}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="driverId"
            label="选择司机"
            rules={[{ required: true, message: '请选择司机' }]}
          >
            <Select placeholder="请选择在岗司机">
              {availableDrivers.map((driver) => (
                <Option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.shift}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDispatch;
