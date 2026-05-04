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
  Descriptions,
  Badge,
} from 'antd';
import { PlusOutlined, CalendarOutlined, TeamOutlined, VideoCameraOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Meeting = () => {
  const [rooms, setRooms] = useState([
    { id: '1', name: '大会议室', floor: '5楼', capacity: 30, equipment: ['投影仪', '白板', '视频会议', '音响'], status: 'available', area: 50, description: '可容纳30人的大型会议室' },
    { id: '2', name: '中型会议室A', floor: '3楼', capacity: 15, equipment: ['投影仪', '白板', '视频会议'], status: 'inUse', area: 30, description: '可容纳15人的中型会议室' },
    { id: '3', name: '小型会议室B', floor: '3楼', capacity: 8, equipment: ['白板', '电视'], status: 'available', area: 15, description: '可容纳8人的小型会议室' },
    { id: '4', name: 'VIP会议室', floor: '8楼', capacity: 20, equipment: ['投影仪', '白板', '视频会议', '音响', '翻译设备'], status: 'available', area: 40, description: 'VIP客户专用会议室' },
  ]);

  const [bookings, setBookings] = useState([
    { id: '1', roomName: '中型会议室A', booker: '张三', department: '技术部', meetingName: '项目周会', date: '2024-01-18', startTime: '14:00', endTime: '16:00', attendees: 12, status: 'approved', equipment: ['投影仪', '白板'] },
    { id: '2', roomName: '大会议室', booker: '李四', department: '市场部', meetingName: '年度总结会', date: '2024-01-19', startTime: '09:00', endTime: '12:00', attendees: 25, status: 'pending', equipment: ['投影仪', '音响', '视频会议'] },
    { id: '3', roomName: '小型会议室B', booker: '王五', department: '人事部', meetingName: '员工面谈', date: '2024-01-18', startTime: '10:00', endTime: '11:00', attendees: 2, status: 'completed', equipment: [] },
  ]);

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getRoomStatusColor = (status) => {
    const colors = { available: 'green', inUse: 'blue', maintenance: 'orange', disabled: 'red' };
    const texts = { available: '可用', inUse: '使用中', maintenance: '维护中', disabled: '停用' };
    return { color: colors[status], text: texts[status] };
  };

  const getBookingStatusColor = (status) => {
    const colors = { pending: 'orange', approved: 'green', rejected: 'red', completed: 'blue' };
    const texts = { pending: '待审批', approved: '已批准', rejected: '已拒绝', completed: '已完成' };
    return { color: colors[status], text: texts[status] };
  };

  const roomColumns = [
    { title: '会议室名称', dataIndex: 'name', key: 'name' },
    { title: '所在楼层', dataIndex: 'floor', key: 'floor' },
    { title: '容纳人数', dataIndex: 'capacity', key: 'capacity', render: (val) => `${val}人` },
    { title: '面积', dataIndex: 'area', key: 'area', render: (val) => `${val}㎡` },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
      render: (equipment) => (
        <Space size={[0, 4]} wrap>
          {equipment.map((item, index) => (
            <Tag key={index} color="blue">{item}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = getRoomStatusColor(status);
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

  const bookingColumns = [
    { title: '会议室', dataIndex: 'roomName', key: 'roomName' },
    { title: '会议名称', dataIndex: 'meetingName', key: 'meetingName' },
    { title: '预订人', dataIndex: 'booker', key: 'booker' },
    { title: '所属部门', dataIndex: 'department', key: 'department' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '时间段', key: 'time', render: (_, record) => `${record.startTime} - ${record.endTime}` },
    { title: '参会人数', dataIndex: 'attendees', key: 'attendees', render: (val) => `${val}人` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = getBookingStatusColor(status);
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

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>会议室管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="会议室总数"
              value={8}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="可用会议室"
              value={6}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="使用中"
              value={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日预订"
              value={5}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="rooms">
        <TabPane tab="会议室列表" key="rooms">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增会议室
              </Button>
            }
          >
            <Table
              columns={roomColumns}
              dataSource={rooms}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="预订管理" key="bookings">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setBookingModalVisible(true)}>
                预订会议室
              </Button>
            }
          >
            <Table
              columns={bookingColumns}
              dataSource={bookings}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="预订会议室"
        open={bookingModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newBooking = {
              ...values,
              id: Date.now().toString(),
              status: 'pending',
            };
            setBookings([...bookings, newBooking]);
            message.success('预订提交成功');
            setBookingModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setBookingModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="roomName"
            label="选择会议室"
            rules={[{ required: true, message: '请选择会议室' }]}
          >
            <Select placeholder="请选择会议室">
              {rooms.filter(r => r.status === 'available').map((room) => (
                <Option key={room.id} value={room.name}>{room.name} ({room.floor}, 可容纳{room.capacity}人)</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="meetingName"
            label="会议名称"
            rules={[{ required: true, message: '请输入会议名称' }]}
          >
            <Input placeholder="请输入会议名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="booker"
                label="预订人"
                rules={[{ required: true, message: '请输入预订人' }]}
              >
                <Input placeholder="请输入预订人" />
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
            name="date"
            label="预订日期"
            rules={[{ required: true, message: '请选择预订日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="attendees"
            label="参会人数"
            rules={[{ required: true, message: '请输入参会人数' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入参会人数" min={1} />
          </Form.Item>
          <Form.Item
            name="equipment"
            label="需要设备"
          >
            <Select mode="multiple" placeholder="请选择需要的设备">
              <Option value="投影仪">投影仪</Option>
              <Option value="白板">白板</Option>
              <Option value="视频会议">视频会议</Option>
              <Option value="音响">音响</Option>
              <Option value="电视">电视</Option>
              <Option value="翻译设备">翻译设备</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Meeting;
