import React, { useState } from 'react';
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  TimePicker,
  Tag,
  message,
  Space,
  Timeline,
  Badge,
} from 'antd';
import { PlusOutlined, CarOutlined, ClockCircleOutlined, ToolOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([
    { id: '1', plateNo: '京A-12345', type: '轿车', brand: '奥迪A6', model: '2023款', purchaseDate: '2023-05-15', mileage: 15000, status: 'available', color: '黑色', fuelType: '汽油' },
    { id: '2', plateNo: '京A-67890', type: '商务车', brand: '别克GL8', model: '2022款', purchaseDate: '2022-08-20', mileage: 35000, status: 'inUse', color: '银色', fuelType: '汽油' },
    { id: '3', plateNo: '京B-11111', type: 'SUV', brand: '丰田汉兰达', model: '2021款', purchaseDate: '2021-10-10', mileage: 52000, status: 'maintenance', color: '白色', fuelType: '汽油' },
  ]);

  const [reservations, setReservations] = useState([
    { id: '1', vehicle: '京A-67890 别克GL8', applicant: '张三', department: '市场部', purpose: '客户接送', startDate: '2024-01-18', startTime: '09:00', endDate: '2024-01-18', endTime: '17:00', status: 'approved', destination: '首都机场' },
    { id: '2', vehicle: '京A-12345 奥迪A6', applicant: '李四', department: '技术部', purpose: '商务洽谈', startDate: '2024-01-19', startTime: '10:00', endDate: '2024-01-19', endTime: '16:00', status: 'pending', destination: '国贸中心' },
  ]);

  const [maintenances, setMaintenances] = useState([
    { id: '1', vehicle: '京B-11111 丰田汉兰达', type: '常规保养', date: '2024-01-15', cost: 800, mileage: 52000, status: 'inProgress', operator: '维修厂A', remark: '更换机油、机滤' },
    { id: '2', vehicle: '京A-67890 别克GL8', type: '故障维修', date: '2024-01-10', cost: 2500, mileage: 35000, status: 'completed', operator: '维修厂A', remark: '更换刹车片' },
  ]);

  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getStatusColor = (status) => {
    const colors = { available: 'green', inUse: 'blue', maintenance: 'orange', retired: 'red' };
    const texts = { available: '可用', inUse: '使用中', maintenance: '维护中', retired: '已退役' };
    return { color: colors[status], text: texts[status] };
  };

  const getReservationStatusColor = (status) => {
    const colors = { pending: 'orange', approved: 'green', rejected: 'red', completed: 'blue' };
    const texts = { pending: '待审批', approved: '已批准', rejected: '已拒绝', completed: '已完成' };
    return { color: colors[status], text: texts[status] };
  };

  const vehicleColumns = [
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo' },
    { title: '车辆类型', dataIndex: 'type', key: 'type' },
    { title: '品牌型号', dataIndex: 'brand', key: 'brand', render: (val, record) => `${val} ${record.model}` },
    { title: '颜色', dataIndex: 'color', key: 'color' },
    { title: '燃油类型', dataIndex: 'fuelType', key: 'fuelType' },
    { title: '购买日期', dataIndex: 'purchaseDate', key: 'purchaseDate' },
    { title: '当前里程', dataIndex: 'mileage', key: 'mileage', render: (val) => `${val.toLocaleString()} 公里` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = getStatusColor(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  const reservationColumns = [
    { title: '使用车辆', dataIndex: 'vehicle', key: 'vehicle' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '所属部门', dataIndex: 'department', key: 'department' },
    { title: '用途', dataIndex: 'purpose', key: 'purpose' },
    { title: '目的地', dataIndex: 'destination', key: 'destination' },
    {
      title: '使用时间',
      key: 'time',
      render: (_, record) => `${record.startDate} ${record.startTime} - ${record.endDate} ${record.endTime}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = getReservationStatusColor(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small">批准</Button>
              <Button type="link" size="small" danger>拒绝</Button>
            </>
          )}
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  const maintenanceColumns = [
    { title: '车辆', dataIndex: 'vehicle', key: 'vehicle' },
    { title: '维护类型', dataIndex: 'type', key: 'type' },
    { title: '维护日期', dataIndex: 'date', key: 'date' },
    { title: '里程数', dataIndex: 'mileage', key: 'mileage', render: (val) => `${val.toLocaleString()} 公里` },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (val) => `¥${val}`,
    },
    { title: '维修厂', dataIndex: 'operator', key: 'operator' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? '已完成' : '进行中'}
        </Tag>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用车管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="车辆总数"
              value={8}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="可用车辆"
              value={5}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="使用中"
              value={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审批申请"
              value={3}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="vehicles">
        <TabPane tab="车辆管理" key="vehicles">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增车辆
              </Button>
            }
          >
            <Table
              columns={vehicleColumns}
              dataSource={vehicles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="用车申请" key="reservations">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setReservationModalVisible(true)}>
                申请用车
              </Button>
            }
          >
            <Table
              columns={reservationColumns}
              dataSource={reservations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="维护记录" key="maintenances">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增维护
              </Button>
            }
          >
            <Table
              columns={maintenanceColumns}
              dataSource={maintenances}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="申请用车"
        open={reservationModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newReservation = {
              ...values,
              id: Date.now().toString(),
              status: 'pending',
            };
            setReservations([...reservations, newReservation]);
            message.success('申请提交成功');
            setReservationModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setReservationModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vehicle"
            label="选择车辆"
            rules={[{ required: true, message: '请选择车辆' }]}
          >
            <Select placeholder="请选择车辆">
              {vehicles.filter(v => v.status === 'available').map((v) => (
                <Option key={v.id} value={`${v.plateNo} ${v.brand}`}>{v.plateNo} {v.brand} ({v.type})</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="所属部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="技术部">技术部</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="人事部">人事部</Option>
                  <Option value="财务部">财务部</Option>
                  <Option value="行政部">行政部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="purpose"
            label="用车用途"
            rules={[{ required: true, message: '请输入用车用途' }]}
          >
            <Input placeholder="请输入用车用途" />
          </Form.Item>
          <Form.Item
            name="destination"
            label="目的地"
            rules={[{ required: true, message: '请输入目的地' }]}
          >
            <Input placeholder="请输入目的地" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vehicle;
