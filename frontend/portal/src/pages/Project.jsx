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
  Tag,
  message,
  Space,
  Progress,
  Timeline,
  Badge,
} from 'antd';
import { PlusOutlined, ProjectOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Project = () => {
  const [projects, setProjects] = useState([
    { id: '1', name: '数字化转型项目', code: 'PRO-2024-001', manager: '张三', startDate: '2024-01-01', endDate: '2024-06-30', progress: 65, status: 'inProgress', budget: 500000, spent: 325000, priority: 'high' },
    { id: '2', name: '新系统开发', code: 'PRO-2024-002', manager: '李四', startDate: '2024-01-15', endDate: '2024-07-15', progress: 40, status: 'inProgress', budget: 300000, spent: 120000, priority: 'medium' },
    { id: '3', name: '市场推广', code: 'PRO-2024-003', manager: '王五', startDate: '2024-01-20', endDate: '2024-02-28', progress: 90, status: 'inProgress', budget: 150000, spent: 135000, priority: 'high' },
    { id: '4', name: '员工培训', code: 'PRO-2024-004', manager: '赵六', startDate: '2024-02-01', endDate: '2024-03-31', progress: 20, status: 'inProgress', budget: 50000, spent: 10000, priority: 'low' },
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', name: '需求分析', project: '数字化转型项目', assignee: '张三', startDate: '2024-01-01', endDate: '2024-01-31', status: 'completed', priority: 'high' },
    { id: '2', name: '系统设计', project: '数字化转型项目', assignee: '李四', startDate: '2024-02-01', endDate: '2024-02-28', status: 'inProgress', priority: 'high' },
    { id: '3', name: '编码开发', project: '新系统开发', assignee: '王五', startDate: '2024-02-01', endDate: '2024-04-30', status: 'pending', priority: 'medium' },
  ]);

  const [milestones, setMilestones] = useState([
    { id: '1', name: '项目启动', project: '数字化转型项目', date: '2024-01-01', status: 'completed' },
    { id: '2', name: '需求评审完成', project: '数字化转型项目', date: '2024-01-31', status: 'completed' },
    { id: '3', name: '设计评审完成', project: '数字化转型项目', date: '2024-02-28', status: 'pending' },
  ]);

  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getPriorityColor = (priority) => {
    const colors = { high: 'red', medium: 'orange', low: 'green' };
    const texts = { high: '高', medium: '中', low: '低' };
    return { color: colors[priority], text: texts[priority] };
  };

  const getStatusColor = (status) => {
    const colors = { inProgress: 'blue', completed: 'green', pending: 'orange', cancelled: 'red' };
    const texts = { inProgress: '进行中', completed: '已完成', pending: '待开始', cancelled: '已取消' };
    return { color: colors[status], text: texts[status] };
  };

  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '项目编码', dataIndex: 'code', key: 'code' },
    { title: '项目经理', dataIndex: 'manager', key: 'manager' },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const { color, text } = getPriorityColor(priority);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" status={progress >= 100 ? 'success' : 'active'} />
      ),
    },
    {
      title: '预算使用',
      key: 'budget',
      render: (_, record) => (
        <div>
          <span>¥{record.spent.toLocaleString()} / ¥{record.budget.toLocaleString()}</span>
          <div style={{ fontSize: 12, color: '#999' }}>
            使用率: {Math.round((record.spent / record.budget) * 100)}%
          </div>
        </div>
      ),
    },
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

  const taskColumns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '所属项目', dataIndex: 'project', key: 'project' },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const { color, text } = getPriorityColor(priority);
        return <Tag color={color}>{text}</Tag>;
      },
    },
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
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>项目管理</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={12}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={8}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={3}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期项目"
              value={1}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="projects">
        <TabPane tab="项目列表" key="projects">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setProjectModalVisible(true)}>
                新建项目
              </Button>
            }
          >
            <Table
              columns={projectColumns}
              dataSource={projects}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="任务管理" key="tasks">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新建任务
              </Button>
            }
          >
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="里程碑" key="milestones">
          <Card>
            <Timeline mode="left">
              {milestones.map((milestone) => (
                <Timeline.Item
                  key={milestone.id}
                  color={milestone.status === 'completed' ? 'green' : 'gray'}
                  dot={milestone.status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  <p><strong>{milestone.name}</strong></p>
                  <p style={{ fontSize: 12, color: '#999' }}>{milestone.project} - {milestone.date}</p>
                  <Tag color={milestone.status === 'completed' ? 'green' : 'orange'}>
                    {milestone.status === 'completed' ? '已完成' : '待完成'}
                  </Tag>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新建项目"
        open={projectModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newProject = {
              ...values,
              id: Date.now().toString(),
              code: `PRO-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
              startDate: values.startDate?.format('YYYY-MM-DD'),
              endDate: values.endDate?.format('YYYY-MM-DD'),
              progress: 0,
              spent: 0,
              status: 'inProgress',
            };
            setProjects([...projects, newProject]);
            message.success('创建成功');
            setProjectModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setProjectModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="项目经理"
                rules={[{ required: true, message: '请输入项目经理' }]}
              >
                <Input placeholder="请输入项目经理" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="budget"
            label="项目预算"
            rules={[{ required: true, message: '请输入项目预算' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入项目预算" min={0} />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Project;
