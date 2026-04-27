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
  Progress,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  WarningOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  updateVehicleStatus,
  updateVehicleOperationalStatus,
  assignVehicleToArea,
  markVehicleAbnormal,
  setSelectedVehicle,
  setFilters,
} from '@/store/slices/vehiclesSlice';
import StatusTag from '@/components/StatusTag';
import type { Vehicle, VehicleStatus, OperationalStatus } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const VehicleManagement = () => {
  const dispatch = useAppDispatch();
  const { list: vehicles, filters, selectedVehicle, loading } = useAppSelector((state) => state.vehicles);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isAbnormalModalOpen, setIsAbnormalModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    total: vehicles.length,
    online: vehicles.filter((v) => v.status === 'online').length,
    offline: vehicles.filter((v) => v.status === 'offline').length,
    idle: vehicles.filter((v) => v.operationalStatus === 'idle').length,
    operating: vehicles.filter((v) => v.operationalStatus === 'operating').length,
    abnormal: vehicles.filter((v) => v.isAbnormal).length,
  }), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.operationalStatus && vehicle.operationalStatus !== filters.operationalStatus) return false;
      if (filters.area && vehicle.area !== filters.area) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          vehicle.plate.toLowerCase().includes(searchLower) ||
          vehicle.area.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [vehicles, filters]);

  const handleStatusChange = (id: number, status: VehicleStatus) => {
    dispatch(updateVehicleStatus({ id, status }));
    message.success(`车辆状态已更新为 ${status === 'online' ? '在线' : status === 'offline' ? '离线' : '维护中'}`);
  };

  const handleOperationalStatusChange = (id: number, operationalStatus: OperationalStatus) => {
    dispatch(updateVehicleOperationalStatus({ id, operationalStatus }));
    message.success(`车辆营运状态已更新`);
  };

  const handleAreaAssign = (id: number, area: string) => {
    dispatch(assignVehicleToArea({ id, area }));
    message.success(`车辆已指派到 ${area}`);
  };

  const handleMarkAbnormal = (id: number, isAbnormal: boolean, reason?: string) => {
    dispatch(markVehicleAbnormal({ id, isAbnormal, reason }));
    message.success(isAbnormal ? '车辆已标记为异常' : '车辆异常标记已取消');
  };

  const handleViewDetail = (vehicle: Vehicle) => {
    dispatch(setSelectedVehicle(vehicle));
    setIsDrawerOpen(true);
  };

  const handleEditStatus = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      status: vehicle.status,
      operationalStatus: vehicle.operationalStatus,
    });
    setIsStatusModalOpen(true);
  };

  const handleEditArea = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({ area: vehicle.area });
    setIsAreaModalOpen(true);
  };

  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择车辆');
      return;
    }
    message.success(`已对 ${selectedRowKeys.length} 辆车执行 ${operation} 操作`);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: '车牌号码',
      dataIndex: 'plate',
      key: 'plate',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '车辆状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag type="vehicle" status={status} />,
    },
    {
      title: '营运状态',
      dataIndex: 'operationalStatus',
      key: 'operationalStatus',
      width: 100,
      render: (status) => <StatusTag type="operational" status={status} />,
    },
    {
      title: '绑定司机',
      dataIndex: 'driverId',
      key: 'driverId',
      width: 100,
      render: (driverId) => driverId ? `司机 #${driverId}` : <Tag color="default">未绑定</Tag>,
    },
    {
      title: '待命区域',
      dataIndex: 'area',
      key: 'area',
      width: 100,
    },
    {
      title: '续航里程',
      dataIndex: 'battery',
      key: 'battery',
      width: 140,
      render: (value) => (
        <Space direction="vertical" size={0} style={{ width: 100 }}>
          <Progress
            percent={value}
            size="small"
            strokeColor={value > 50 ? '#52c41a' : value > 20 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
          <Text type={value > 50 ? 'success' : value > 20 ? 'warning' : 'danger'} style={{ fontSize: 12 }}>
            {value}%
          </Text>
        </Space>
      ),
    },
    {
      title: '状态标识',
      dataIndex: 'isAbnormal',
      key: 'isAbnormal',
      width: 100,
      render: (isAbnormal, record) => (
        <Space>
          {isAbnormal ? (
            <Badge
              status="error"
              text={
                <Tooltip title={record.abnormalReason}>
                  异常
                </Tooltip>
              }
            />
          ) : (
            <Badge status="success" text="正常" />
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditStatus(record)}>
            状态
          </Button>
          <Button type="link" size="small" onClick={() => handleEditArea(record)}>
            指派
          </Button>
          <Popconfirm
            title="标记异常"
            description="确定要标记此车辆为异常吗？"
            icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
            onConfirm={() => handleMarkAbnormal(record.id, !record.isAbnormal)}
          >
            <Button type="link" size="small" danger={record.isAbnormal}>
              {record.isAbnormal ? '取消异常' : '标记异常'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const areas = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="总车辆数"
              value={stats.total}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="在线车辆"
              value={stats.online}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="空闲车辆"
              value={stats.idle}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="营运车辆"
              value={stats.operating}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="离线车辆"
              value={stats.offline}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="异常车辆"
              value={stats.abnormal}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索车牌或区域"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => dispatch(setFilters({ search: value }))}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="车辆状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
              <Option value="maintenance">维护中</Option>
            </Select>
            <Select
              placeholder="营运状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ operationalStatus: value }))}
            >
              <Option value="idle">空闲</Option>
              <Option value="operating">营运中</Option>
              <Option value="assigned">已派单</Option>
            </Select>
            <Select
              placeholder="待命区域"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ area: value }))}
            >
              {areas.map((area) => (
                <Option key={area} value={area}>{area}</Option>
              ))}
            </Select>
          </Space>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
                <Button size="small" onClick={() => handleBatchOperation('状态变更')}>
                  状态变更
                </Button>
                <Button size="small" onClick={() => handleBatchOperation('区域指派')}>
                  区域指派
                </Button>
                <Button size="small" danger onClick={() => handleBatchOperation('标记异常')}>
                  标记异常
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
          dataSource={filteredVehicles}
          rowKey="id"
          rowSelection={rowSelection}
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
        title="车辆详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedVehicle && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="车牌号码" span={2}>
                <Text strong style={{ fontSize: 18 }}>{selectedVehicle.plate}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="车辆状态">
                <StatusTag type="vehicle" status={selectedVehicle.status} />
              </Descriptions.Item>
              <Descriptions.Item label="营运状态">
                <StatusTag type="operational" status={selectedVehicle.operationalStatus} />
              </Descriptions.Item>
              <Descriptions.Item label="绑定司机">
                {selectedVehicle.driverId ? `司机 #${selectedVehicle.driverId}` : '未绑定'}
              </Descriptions.Item>
              <Descriptions.Item label="待命区域">
                {selectedVehicle.area}
              </Descriptions.Item>
              <Descriptions.Item label="续航里程">
                <Progress
                  percent={selectedVehicle.battery}
                  strokeColor={selectedVehicle.battery > 50 ? '#52c41a' : selectedVehicle.battery > 20 ? '#faad14' : '#ff4d4f'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="位置坐标">
                <Text type="secondary" code>
                  {selectedVehicle.location.lat.toFixed(4)}, {selectedVehicle.location.lng.toFixed(4)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="异常状态">
                {selectedVehicle.isAbnormal ? (
                  <Tag color="error">异常 - {selectedVehicle.abnormalReason || '未说明'}</Tag>
                ) : (
                  <Tag color="success">正常</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedVehicle.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="操作记录" style={{ marginTop: 16 }}>
              <div className="timeline-item">
                <Text strong>车辆上线</Text>
                <br />
                <Text type="secondary">{new Date().toLocaleString('zh-CN')}</Text>
              </div>
              <div className="timeline-item">
                <Text strong>状态变更: 空闲 → 营运中</Text>
                <br />
                <Text type="secondary">{new Date(Date.now() - 3600000).toLocaleString('zh-CN')}</Text>
              </div>
              <div className="timeline-item">
                <Text strong>区域指派: 朝阳区</Text>
                <br />
                <Text type="secondary">{new Date(Date.now() - 86400000).toLocaleString('zh-CN')}</Text>
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        title="状态变更"
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        onOk={() => {
          const values = form.getFieldsValue();
          if (editingVehicle) {
            handleStatusChange(editingVehicle.id, values.status);
            handleOperationalStatusChange(editingVehicle.id, values.operationalStatus);
          }
          setIsStatusModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="车辆状态">
            <Select>
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
              <Option value="maintenance">维护中</Option>
            </Select>
          </Form.Item>
          <Form.Item name="operationalStatus" label="营运状态">
            <Select>
              <Option value="idle">空闲</Option>
              <Option value="operating">营运中</Option>
              <Option value="assigned">已派单</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="区域指派"
        open={isAreaModalOpen}
        onCancel={() => setIsAreaModalOpen(false)}
        onOk={() => {
          const values = form.getFieldsValue();
          if (editingVehicle && values.area) {
            handleAreaAssign(editingVehicle.id, values.area);
          }
          setIsAreaModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="area" label="选择区域" rules={[{ required: true, message: '请选择区域' }]}>
            <Select placeholder="请选择待命区域">
              {areas.map((area) => (
                <Option key={area} value={area}>{area}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleManagement;
