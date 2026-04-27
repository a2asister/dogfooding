import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Switch,
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
  InputNumber,
  List,
  Timeline,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  addArea,
  updateArea,
  deleteArea,
  toggleDispatchRule,
  togglePriorityRule,
  toggleAlertParameter,
  toggleSchedulingStrategy,
  updateCapacityThresholds,
  resetConfig,
  setDirty,
} from '@/store/slices/configSlice';
import StatCard from '@/components/StatCard';
import type { Area, DispatchRule, PriorityRule, AlertParameter, SchedulingStrategy, CapacityThreshold } from '@/types';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const DispatchConfig = () => {
  const dispatch = useAppDispatch();
  const { data, isDirty } = useAppSelector((state) => state.config);

  const [activeTab, setActiveTab] = useState<string>('areas');
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editingRule, setEditingRule] = useState<DispatchRule | null>(null);
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    totalAreas: data.areas.length,
    activeAreas: data.areas.filter((a) => a.isActive).length,
    activeRules: data.dispatchRules.filter((r) => r.isActive).length,
    activeStrategies: data.schedulingStrategies.filter((s) => s.isActive).length,
  }), [data]);

  const handleAddArea = () => {
    setEditingArea(null);
    form.resetFields();
    setIsAreaModalOpen(true);
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    form.setFieldsValue(area);
    setIsAreaModalOpen(true);
  };

  const handleDeleteArea = (id: number) => {
    dispatch(deleteArea(id));
    message.success('区域已删除');
  };

  const handleSaveArea = () => {
    form.validateFields().then((values) => {
      if (editingArea) {
        dispatch(updateArea({ ...editingArea, ...values }));
        message.success('区域已更新');
      } else {
        dispatch(addArea(values));
        message.success('区域已添加');
      }
      setIsAreaModalOpen(false);
    });
  };

  const handleToggleDispatchRule = (id: number, isActive: boolean) => {
    dispatch(toggleDispatchRule({ id, isActive }));
    message.success(isActive ? '规则已启用' : '规则已禁用');
  };

  const handleTogglePriorityRule = (id: number, isActive: boolean) => {
    dispatch(togglePriorityRule({ id, isActive }));
    message.success(isActive ? '规则已启用' : '规则已禁用');
  };

  const handleToggleAlertParameter = (id: number, isEnabled: boolean) => {
    dispatch(toggleAlertParameter({ id, isEnabled }));
    message.success(isEnabled ? '告警参数已启用' : '告警参数已禁用');
  };

  const handleToggleSchedulingStrategy = (id: number, isActive: boolean) => {
    dispatch(toggleSchedulingStrategy({ id, isActive }));
    message.success(isActive ? '策略已启用' : '策略已禁用');
  };

  const handleSaveCapacityThresholds = (values: CapacityThreshold) => {
    dispatch(updateCapacityThresholds(values));
    message.success('运力阈值已更新');
    setIsCapacityModalOpen(false);
  };

  const handleResetConfig = () => {
    dispatch(resetConfig());
    message.success('配置已重置');
  };

  const handleSaveAll = () => {
    dispatch(setDirty(false));
    message.success('所有配置已保存');
  };

  const areaColumns: ColumnsType<Area> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '区域名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '区域代码',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (value) => (
        <Tag color={value <= 3 ? 'error' : value <= 6 ? 'warning' : 'success'}>
          优先级 {value}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => dispatch(updateArea({ ...record, isActive: checked }))}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditArea(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除区域"
            description="确定要删除此区域吗？"
            onConfirm={() => handleDeleteArea(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dispatchRuleColumns: ColumnsType<DispatchRule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (value) => (
        <Tag color={value === 1 ? 'error' : value === 2 ? 'warning' : 'success'}>
          优先级 {value}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleDispatchRule(record.id, checked)}
        />
      ),
    },
  ];

  const priorityRuleColumns: ColumnsType<PriorityRule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '条件',
      key: 'conditions',
      render: (_, record) => (
        <Space wrap>
          {record.conditions.map((cond, idx) => (
            <Tag key={idx}>
              {cond.field} {cond.operator} {String(cond.value)}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (value) => (
        <Text strong style={{ color: value >= 80 ? '#ff4d4f' : value >= 50 ? '#faad14' : '#52c41a' }}>
          {value}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleTogglePriorityRule(record.id, checked)}
        />
      ),
    },
  ];

  const alertParameterColumns: ColumnsType<AlertParameter> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '阈值',
      key: 'threshold',
      render: (_, record) => (
        <Text>{record.threshold} {record.unit}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (isEnabled, record) => (
        <Switch
          checked={isEnabled}
          onChange={(checked) => handleToggleAlertParameter(record.id, checked)}
        />
      ),
    },
  ];

  const schedulingStrategyColumns: ColumnsType<SchedulingStrategy> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '时段',
      key: 'timeRange',
      render: (_, record) => (
        <Text code>{record.shiftStart} - {record.shiftEnd}</Text>
      ),
    },
    {
      title: '车辆配置',
      dataIndex: 'vehicleCount',
      key: 'vehicleCount',
      render: (value) => <Tag color="blue">{value} 辆</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleSchedulingStrategy(record.id, checked)}
        />
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="总区域数"
            value={stats.totalAreas}
            suffix="个"
            icon={<GlobalOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
            progress={(stats.activeAreas / stats.totalAreas) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="活跃区域"
            value={stats.activeAreas}
            suffix="个"
            icon={<GlobalOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
            color="#52c41a"
            progress={(stats.activeAreas / stats.totalAreas) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="活跃规则"
            value={stats.activeRules}
            suffix="条"
            icon={<SafetyOutlined style={{ fontSize: 24, color: '#faad14' }} />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="活跃策略"
            value={stats.activeStrategies}
            suffix="个"
            icon={<ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Card
        extra={
          <Space>
            {isDirty && (
              <Tag color="warning" icon={<SaveOutlined />}>
                有未保存的更改
              </Tag>
            )}
            <Popconfirm
              title="重置配置"
              description="确定要将所有配置重置为默认值吗？"
              onConfirm={handleResetConfig}
            >
              <Button icon={<ReloadOutlined />}>
                重置
              </Button>
            </Popconfirm>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAll} disabled={!isDirty}>
              保存所有
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="区域划分" key="areas" icon={<GlobalOutlined />}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">管理调度区域，配置区域边界、优先级等</Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddArea}>
                添加区域
              </Button>
            </div>
            <Table
              columns={areaColumns}
              dataSource={data.areas}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="调度规则" key="dispatchRules" icon={<SafetyOutlined />}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">配置派单规则，启用/禁用不同的派单策略</Text>
            </div>
            <Table
              columns={dispatchRuleColumns}
              dataSource={data.dispatchRules}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="优先级规则" key="priorityRules" icon={<SettingOutlined />}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">配置订单优先级规则，根据条件设置不同的权重</Text>
            </div>
            <Table
              columns={priorityRuleColumns}
              dataSource={data.priorityRules}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="运力阈值" key="capacityThresholds" icon={<SafetyOutlined />}>
            <Card
              type="inner"
              title="运力阈值配置"
              extra={
                <Button type="primary" onClick={() => {
                  form.setFieldsValue(data.capacityThresholds);
                  setIsCapacityModalOpen(true);
                }}>
                  编辑配置
                </Button>
              }
            >
              <Descriptions bordered column={2}>
                <Descriptions.Item label="最小车辆数">
                  {data.capacityThresholds.minimumVehicles} 辆
                </Descriptions.Item>
                <Descriptions.Item label="警告阈值">
                  {data.capacityThresholds.warningThreshold} 辆
                </Descriptions.Item>
                <Descriptions.Item label="临界阈值">
                  {data.capacityThresholds.criticalThreshold} 辆
                </Descriptions.Item>
                <Descriptions.Item label="空闲车辆比例">
                  {(data.capacityThresholds.idleVehicleRatio * 100).toFixed(0)}%
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Card type="inner" title="阈值说明" size="small">
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>最小车辆数</Text>: 每个区域需要保持的最小在线车辆数量
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>警告阈值</Text>: 当车辆数低于此值时触发警告
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <Text strong>临界阈值</Text>: 当车辆数低于此值时触发严重告警
                  </Timeline.Item>
                  <Timeline.Item color="purple">
                    <Text strong>空闲车辆比例</Text>: 系统建议保持的空闲车辆比例
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Card>
          </TabPane>

          <TabPane tab="告警参数" key="alertParameters" icon={<WarningOutlined />}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">配置各类告警的触发参数和阈值</Text>
            </div>
            <Table
              columns={alertParameterColumns}
              dataSource={data.alertParameters}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="排班策略" key="schedulingStrategies" icon={<ClockCircleOutlined />}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">配置不同时段的排班策略，自动调整运力配置</Text>
            </div>
            <Table
              columns={schedulingStrategyColumns}
              dataSource={data.schedulingStrategies}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingArea ? '编辑区域' : '添加区域'}
        open={isAreaModalOpen}
        onCancel={() => setIsAreaModalOpen(false)}
        onOk={handleSaveArea}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="区域名称"
            rules={[{ required: true, message: '请输入区域名称' }]}
          >
            <Input placeholder="请输入区域名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="区域代码"
            rules={[{ required: true, message: '请输入区域代码' }]}
          >
            <Input placeholder="请输入区域代码，如 AREA_001" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value={1}>最高优先级 (1)</Option>
              <Option value={2}>高优先级 (2)</Option>
              <Option value={3}>中高优先级 (3)</Option>
              <Option value={4}>中优先级 (4)</Option>
              <Option value={5}>中低优先级 (5)</Option>
              <Option value={6}>低优先级 (6)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑运力阈值"
        open={isCapacityModalOpen}
        onCancel={() => setIsCapacityModalOpen(false)}
        onOk={() => {
          form.validateFields().then((values) => {
            handleSaveCapacityThresholds(values);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="minimumVehicles"
            label="最小车辆数"
            rules={[{ required: true, message: '请输入最小车辆数' }]}
          >
            <InputNumber
              placeholder="请输入最小车辆数"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="warningThreshold"
            label="警告阈值"
            rules={[{ required: true, message: '请输入警告阈值' }]}
          >
            <InputNumber
              placeholder="请输入警告阈值"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="criticalThreshold"
            label="临界阈值"
            rules={[{ required: true, message: '请输入临界阈值' }]}
          >
            <InputNumber
              placeholder="请输入临界阈值"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="idleVehicleRatio"
            label="空闲车辆比例"
            rules={[{ required: true, message: '请输入空闲车辆比例' }]}
          >
            <InputNumber
              placeholder="请输入空闲车辆比例 (0-1)"
              style={{ width: '100%' }}
              min={0}
              max={1}
              step={0.1}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DispatchConfig;
