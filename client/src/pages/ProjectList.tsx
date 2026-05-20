import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Project, ProjectType, ProjectStatus, User } from '../types';
import { projectApi, userApi } from '../services/api';
import { PROJECT_TYPE_OPTIONS } from '../types';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const { Option } = Select;

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : undefined;
      const res = await projectApi.getProjects(params);
      if (res.code === 0) {
        setProjects(res.data);
      }
    } catch (err) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAllUsers();
      if (res.code === 0) {
        setUsers(res.data);
      }
    } catch (err) {
      message.error('获取用户列表失败');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [filterStatus]);

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: [dayjs(project.startDate), dayjs(project.endDate)],
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: {
    name: string;
    type: ProjectType;
    manager: string;
    dateRange: [dayjs.Dayjs, dayjs.Dayjs];
    description: string;
  }) => {
    try {
      const projectData = {
        name: values.name,
        type: values.type,
        manager: values.manager,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        description: values.description || '',
      };

      if (editingProject) {
        const res = await projectApi.updateProject(editingProject.id, projectData);
        if (res.code === 0) {
          message.success('项目更新成功');
          setModalVisible(false);
          fetchProjects();
        }
      } else {
        const res = await projectApi.createProject(projectData);
        if (res.code === 0) {
          message.success('项目创建成功');
          setModalVisible(false);
          fetchProjects();
        }
      }
    } catch (err) {
      message.error(editingProject ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await projectApi.deleteProject(id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchProjects();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleToggleArchive = async (project: Project) => {
    try {
      const newStatus: ProjectStatus = project.status === 'active' ? 'archived' : 'active';
      const res = await projectApi.updateProject(project.id, { status: newStatus });
      if (res.code === 0) {
        message.success(newStatus === 'archived' ? '已归档' : '已恢复');
        fetchProjects();
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ProjectType) => {
        const opt = PROJECT_TYPE_OPTIONS.find((o) => o.value === type);
        return <Tag color={type === 'software' ? 'blue' : 'green'}>{opt?.label || type}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '起止时间',
      key: 'period',
      render: (_: unknown, record: Project) => (
        <span>
          {record.startDate} ~ {record.endDate}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectStatus) => (
        <Tag color={status === 'active' ? 'processing' : 'default'}>
          {status === 'active' ? '进行中' : '已归档'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: unknown, record: Project) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.status === 'active' ? <FolderOpenOutlined /> : <FolderOutlined />}
            onClick={() => handleToggleArchive(record)}
          >
            {record.status === 'active' ? '归档' : '恢复'}
          </Button>
          <Popconfirm title="确定删除此项目吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    archived: projects.filter((p) => p.status === 'archived').length,
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>项目总数</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.total}</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>进行中</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#1890ff' }}>{stats.active}</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>已归档</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#8c8c8c' }}>{stats.archived}</div>
          </Col>
        </Row>
      </Card>

      <Card
        title="项目列表"
        extra={
          <Space>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'active', label: '进行中' },
                { value: 'archived', label: '已归档' },
              ]}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建项目
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={projects}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select options={PROJECT_TYPE_OPTIONS} placeholder="请选择项目类型" />
          </Form.Item>
          <Form.Item
            name="manager"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              {users.map((u) => (
                <Option key={u.id} value={u.realName}>
                  {u.realName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="起止时间"
            rules={[{ required: true, message: '请选择起止时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingProject ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProjectList;
