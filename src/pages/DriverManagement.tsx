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
  Divider,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  UserOutlined,
  WarningOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  updateDriverStatus,
  updateDriverShift,
  lockDriver,
  markDriverAbnormal,
  setSelectedDriver,
  setFilters,
} from '@/store/slices/driversSlice';
import StatusTag from '@/components/StatusTag';
import type { Driver, DriverStatus } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const DriverManagement = () => {
  const dispatch = useAppDispatch();
  const { list: drivers, filters, selectedDriver, loading } = useAppSelector((state) => state.drivers);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAbnormalModalOpen, setIsAbnormalModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    total: drivers.length,
    onDuty: drivers.filter((d) => d.status === 'on duty').length,
    offDuty: drivers.filter((d) => d.status === 'off duty').length,
    onLeave: drivers.filter((d) => d.status === 'on leave').length,
    locked: drivers.filter((d) => d.isLocked).length,
    abnormal: drivers.filter((d) => d.isAbnormal).length,
  }), [drivers]);

  const filteredDrivers = useMemo(() => {
    let result = drivers;

    if (activeTab === 'onDuty') {
      result = result.filter((d) => d.status === 'on duty');
    } else if (activeTab === 'offDuty') {
      result = result.filter((d) => d.status === 'off duty' || d.status === 'on leave');
    } else if (activeTab === 'locked') {
      result = result.filter((d) => d.isLocked);
    } else if (activeTab === 'abnormal') {
      result = result.filter((d) => d.isAbnormal);
    }

    return result.filter((driver) => {
      if (filters.status && driver.status !== filters.status) return false;
      if (filters.shift && driver.shift !== filters.shift) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          driver.name.toLowerCase().includes(searchLower) ||
          driver.shift.toLowerCase().includes(searchLower) ||
          driver.phone.includes(searchLower)
        );
      }
      return true;
    });
  }, [drivers, filters, activeTab]);

  const handleStatusChange = (id: number, status: DriverStatus) => {
    dispatch(updateDriverStatus({ id, status }));
    message.success('司机状态已更新');
  };

  const handleShiftChange = (id: number, shift: string) => {
    dispatch(updateDriverShift({ id, shift }));
    message.success('司机排班已更新');
  };

  const handleLockDriver = (id: number, isLocked: boolean) => {
    dispatch(lockDriver({ id, isLocked }));
    message.success(isLocked ? '司机已锁定' : '司机已解锁');
  };

  const handleMarkAbnormal = (id: number, isAbnormal: boolean, reason?: string) => {
    dispatch(markDriverAbnormal({ id, isAbnormal, reason }));
    message.success(isAbnormal ? '司机已标记为异常' : '司机异常标记已取消');
  };

  const handleViewDetail = (driver: Driver) => {
    dispatch(setSelectedDriver(driver));
    setIsDrawerOpen(true);
  };

  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择司机');
      return;
    }
    message.success(`已对 ${selectedRowKeys.length} 个司机执行 ${operation} 操作`);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<Driver> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isLocked && (
            <Tooltip title="已锁定">
              <LockOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
          {record.isAbnormal && (
            <Tooltip title="异常">
              <WarningOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '在岗状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag type="driver" status={status} />,
    },
    {
      title: '排班',
      dataIndex: 'shift',
      key: 'shift',
      width: 80,
      render: (shift) => (
        <Tag color={shift === '早班' ? 'blue' : shift === '中班' ? 'green' : shift === '晚班' ? 'orange' : 'purple'}>
          {shift}
        </Tag>
      ),
    },
    {
      title: '服务评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (rating) => (
        <Space direction="vertical" size="small" style={{ lineHeight: 1.5 }}>
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <Text strong style={{ color: rating >= 4.5 ? '#52c41a' : rating >= 4.0 ? '#1890ff' : '#faad14' }}>
              {rating.toFixed(1)}
            </Text>
          </Space>
          <Progress
            percent={rating * 20}
            size="small"
            style={{ width: 100 }}
            strokeColor={rating >= 4.5 ? '#52c41a' : rating >= 4.0 ? '#1890ff' : '#faad14'}
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: '接单量',
      dataIndex: 'orders',
      key: 'orders',
      width: 80,
      render: (orders) => (
        <Text strong>{orders}</Text>
      ),
    },
    {
      title: '工作时长',
      dataIndex: 'workingHours',
      key: 'workingHours',
      width: 140,
      render: (hours) => (
        <Space direction="vertical" size="small" style={{ lineHeight: 1.5 }}>
          <Space>
            <ClockCircleOutlined />
            <Text strong style={{ color: hours > 40 ? '#ff4d4f' : 'inherit' }}>{hours} 小时</Text>
          </Space>
          {hours > 40 && (
            <Tag color="orange" icon={<WarningOutlined />} style={{ margin: 0 }}>
              超时
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '违规记录',
      dataIndex: 'violations',
      key: 'violations',
      width: 80,
      render: (violations) => (
        violations > 0 ? (
          <Badge count={violations} overflowCount={9} />
        ) : (
          <Tag color="success">无</Tag>
        )
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '状态标识',
      key: 'flags',
      width: 120,
      render: (_, record) => (
        <Space wrap>
          {record.isLocked && (
            <Tag color="red">已锁定</Tag>
          )}
          {record.isAbnormal && (
            <Tag color="orange">
              异常 - {record.abnormalReason || '未说明'}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
            setEditingDriver(record);
            form.setFieldsValue({
              status: record.status,
              shift: record.shift,
            });
            setIsStatusModalOpen(true);
          }}>
            排班
          </Button>
          <Popconfirm
            title={record.isLocked ? '解锁司机' : '锁定司机'}
            description={record.isLocked ? '确定要解锁此司机吗？' : '确定要锁定此司机吗？'}
            icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
            onConfirm={() => handleLockDriver(record.id, !record.isLocked)}
          >
            <Button
              type="link"
              size="small"
              icon={record.isLocked ? <UnlockOutlined /> : <LockOutlined />}
              danger={record.isLocked}
            >
              {record.isLocked ? '解锁' : '锁定'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={record.isAbnormal ? '取消异常标记' : '标记异常'}
            description={record.isAbnormal ? '确定要取消此司机的异常标记吗？' : '确定要标记此司机为异常吗？'}
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

  const shifts = ['早班', '中班', '晚班', '夜班'];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="司机总数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="在岗司机"
              value={stats.onDuty}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="离岗司机"
              value={stats.offDuty + stats.onLeave}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="锁定司机"
              value={stats.locked}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="异常司机"
              value={stats.abnormal}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部司机 (${stats.total})`} key="all" />
          <TabPane tab={`在岗司机 (${stats.onDuty})`} key="onDuty" />
          <TabPane tab={`离岗司机 (${stats.offDuty + stats.onLeave})`} key="offDuty" />
          <TabPane tab={`锁定司机 (${stats.locked})`} key="locked" />
          <TabPane tab={`异常司机 (${stats.abnormal})`} key="abnormal" />
        </Tabs>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="搜索司机姓名、电话"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => dispatch(setFilters({ search: value }))}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="在岗状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <Option value="on duty">在岗</Option>
              <Option value="off duty">离岗</Option>
              <Option value="on leave">休假</Option>
            </Select>
            <Select
              placeholder="排班"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => dispatch(setFilters({ shift: value }))}
            >
              {shifts.map((shift) => (
                <Option key={shift} value={shift}>{shift}</Option>
              ))}
            </Select>
          </Space>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 个司机</Text>
                <Button size="small" onClick={() => handleBatchOperation('排班配置')}>
                  排班配置
                </Button>
                <Button size="small" danger onClick={() => handleBatchOperation('批量锁定')}>
                  批量锁定
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
          dataSource={filteredDrivers}
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
        title="司机详情"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedDriver && (
          <div>
            <Card type="inner" title="基本信息">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="姓名" span={2}>
                  <Text strong style={{ fontSize: 18 }}>{selectedDriver.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="在岗状态">
                  <StatusTag type="driver" status={selectedDriver.status} />
                </Descriptions.Item>
                <Descriptions.Item label="排班">
                  <Tag color={selectedDriver.shift === '早班' ? 'blue' : selectedDriver.shift === '中班' ? 'green' : selectedDriver.shift === '晚班' ? 'orange' : 'purple'}>
                    {selectedDriver.shift}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {selectedDriver.phone}
                </Descriptions.Item>
                <Descriptions.Item label="驾照编号">
                  {selectedDriver.licenseNumber}
                </Descriptions.Item>
                <Descriptions.Item label="服务评分" span={2}>
                  <Space>
                    <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 18, color: selectedDriver.rating >= 4.5 ? '#52c41a' : selectedDriver.rating >= 4.0 ? '#1890ff' : '#faad14' }}>
                      {selectedDriver.rating.toFixed(1)}
                    </Text>
                    <Progress
                      percent={selectedDriver.rating * 20}
                      style={{ width: 120 }}
                      strokeColor={selectedDriver.rating >= 4.5 ? '#52c41a' : selectedDriver.rating >= 4.0 ? '#1890ff' : '#faad14'}
                    />
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="工作统计" style={{ marginTop: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="接单量">
                  <Text strong style={{ fontSize: 18 }}>{selectedDriver.orders}</Text> 单
                </Descriptions.Item>
                <Descriptions.Item label="工作时长">
                  <Text strong style={{ fontSize: 18 }}>{selectedDriver.workingHours}</Text> 小时
                  {selectedDriver.workingHours > 40 && (
                    <Tag color="orange" style={{ marginLeft: 8 }} icon={<WarningOutlined />}>
                      连续工作超时
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="违规记录">
                  {selectedDriver.violations > 0 ? (
                    <Space>
                      <Badge count={selectedDriver.violations} />
                      <Text type="danger">存在违规记录</Text>
                    </Space>
                  ) : (
                    <Tag color="success">无违规记录</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="锁定状态">
                  {selectedDriver.isLocked ? (
                    <Tag color="red" icon={<LockOutlined />}>已锁定</Tag>
                  ) : (
                    <Tag color="success" icon={<UnlockOutlined />}>正常</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="异常状态" span={2}>
                  {selectedDriver.isAbnormal ? (
                    <Tag color="orange" icon={<WarningOutlined />}>
                      异常 - {selectedDriver.abnormalReason || '未说明'}
                    </Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card type="inner" title="操作记录" style={{ marginTop: 16 }}>
              <div className="timeline-item">
                <Text strong>接单完成</Text>
                <br />
                <Text type="secondary">{new Date().toLocaleString('zh-CN')}</Text>
              </div>
              <div className="timeline-item">
                <Text strong>排班变更: 中班 → 晚班</Text>
                <br />
                <Text type="secondary">{new Date(Date.now() - 86400000).toLocaleString('zh-CN')}</Text>
              </div>
              <div className="timeline-item">
                <Text strong>司机上线</Text>
                <br />
                <Text type="secondary">{new Date(Date.now() - 172800000).toLocaleString('zh-CN')}</Text>
              </div>
            </Card>

            <Divider />

            <Space>
              <Button
                onClick={() => {
                  setEditingDriver(selectedDriver);
                  form.setFieldsValue({
                    status: selectedDriver.status,
                    shift: selectedDriver.shift,
                  });
                  setIsStatusModalOpen(true);
                  setIsDrawerOpen(false);
                }}
              >
                排班配置
              </Button>
              <Popconfirm
                title={selectedDriver.isLocked ? '解锁司机' : '锁定司机'}
                description={selectedDriver.isLocked ? '确定要解锁此司机吗？' : '确定要锁定此司机吗？'}
                icon={<ExclamationCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />}
                onConfirm={() => {
                  handleLockDriver(selectedDriver.id, !selectedDriver.isLocked);
                  setIsDrawerOpen(false);
                }}
              >
                <Button danger={selectedDriver.isLocked}>
                  {selectedDriver.isLocked ? '解锁司机' : '锁定司机'}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title="排班配置"
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        onOk={() => {
          form.validateFields().then((values) => {
            if (editingDriver) {
              handleStatusChange(editingDriver.id, values.status);
              handleShiftChange(editingDriver.id, values.shift);
            }
            setIsStatusModalOpen(false);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="在岗状态">
            <Select>
              <Option value="on duty">在岗</Option>
              <Option value="off duty">离岗</Option>
              <Option value="on leave">休假</Option>
            </Select>
          </Form.Item>
          <Form.Item name="shift" label="排班">
            <Select>
              {shifts.map((shift) => (
                <Option key={shift} value={shift}>{shift}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DriverManagement;
