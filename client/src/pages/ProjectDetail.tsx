import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Descriptions,
  Row,
  Col,
  Dropdown,
  MenuProps,
  Timeline,
  Empty,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  PushpinOutlined,
  PushpinFilled,
  FolderOpenOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  Project,
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskLog,
} from '../types';
import { projectApi, taskApi } from '../services/api';
import {
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
} from '../types';

const { TextArea } = Input;

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [form] = Form.useForm();
  const [includeArchived, setIncludeArchived] = useState(false);

  const fetchProject = async () => {
    if (!id) return;
    try {
      const res = await projectApi.getProject(id);
      if (res.code === 0) {
        setProject(res.data);
      }
    } catch (err) {
      message.error('获取项目信息失败');
    }
  };

  const fetchTasks = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await taskApi.getTasks(id, { includeArchived });
      if (res.code === 0) {
        setTasks(res.data);
      }
    } catch (err) {
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskLogs = async (taskId: string) => {
    if (!id) return;
    try {
      const res = await taskApi.getTaskLogs(id, taskId);
      if (res.code === 0) {
        setTaskLogs(res.data);
      }
    } catch (err) {
      message.error('获取操作日志失败');
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id, includeArchived]);

  const handleCreateTask = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'task',
      status: 'todo',
      priority: 'medium',
      reporter: '当前用户',
      assignee: '当前用户',
    });
    setTaskModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setTaskModalVisible(true);
  };

  const handleSubmitTask = async (values: {
    title: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    description: string;
    assignee: string;
    reporter: string;
    dueDate?: dayjs.Dayjs;
    iteration: string;
  }) => {
    if (!id) return;
    try {
      const taskData = {
        title: values.title,
        type: values.type,
        status: values.status,
        priority: values.priority,
        description: values.description || '',
        assignee: values.assignee,
        reporter: values.reporter,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
        iteration: values.iteration || '',
        parentId: null,
      };

      if (editingTask) {
        const res = await taskApi.updateTask(id, editingTask.id, { ...taskData, operator: '当前用户' });
        if (res.code === 0) {
          message.success('任务更新成功');
          setTaskModalVisible(false);
          fetchTasks();
        }
      } else {
        const res = await taskApi.createTask(id, taskData);
        if (res.code === 0) {
          message.success('任务创建成功');
          setTaskModalVisible(false);
          fetchTasks();
        }
      }
    } catch (err) {
      message.error(editingTask ? '更新失败' : '创建失败');
    }
  };

  const handleViewTask = async (task: Task) => {
    setSelectedTask(task);
    await fetchTaskLogs(task.id);
    setDetailModalVisible(true);
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!id) return;
    try {
      const res = await taskApi.updateTask(id, task.id, { status: newStatus, operator: '当前用户' });
      if (res.code === 0) {
        message.success('状态更新成功');
        fetchTasks();
      }
    } catch (err) {
      message.error('状态更新失败');
    }
  };

  const handlePinToggle = async (task: Task) => {
    if (!id) return;
    try {
      if (task.isPinned) {
        await taskApi.unpinTask(id, task.id, '当前用户');
      } else {
        await taskApi.pinTask(id, task.id, '当前用户');
      }
      message.success(task.isPinned ? '已取消置顶' : '已置顶');
      fetchTasks();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleArchiveToggle = async (task: Task) => {
    if (!id) return;
    try {
      if (task.isArchived) {
        await taskApi.unarchiveTask(id, task.id, '当前用户');
      } else {
        await taskApi.archiveTask(id, task.id, '当前用户');
      }
      message.success(task.isArchived ? '已取消归档' : '已归档');
      fetchTasks();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!id) return;
    try {
      const res = await taskApi.deleteTask(id, task.id, '当前用户');
      if (res.code === 0) {
        message.success('删除成功');
        setDetailModalVisible(false);
        fetchTasks();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const getTaskMenu = (task: Task): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: '编辑',
        onClick: () => handleEditTask(task),
      },
      {
        key: 'pin',
        icon: task.isPinned ? <PushpinFilled /> : <PushpinOutlined />,
        label: task.isPinned ? '取消置顶' : '置顶',
        onClick: () => handlePinToggle(task),
      },
      {
        key: 'archive',
        icon: <FolderOpenOutlined />,
        label: task.isArchived ? '取消归档' : '归档',
        onClick: () => handleArchiveToggle(task),
      },
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: '确定删除此任务吗？',
            onOk: () => handleDeleteTask(task),
          });
        },
      },
    ],
  });

  const getLogActionText = (log: TaskLog) => {
    const actionMap: Record<string, string> = {
      create: '创建了任务',
      update: '更新了任务',
      status_change: `状态从 ${log.oldValue} 变为 ${log.newValue}`,
      assign: `分配给 ${log.newValue}`,
      pin: '置顶了任务',
      unpin: '取消置顶',
      archive: '归档了任务',
      unarchive: '取消归档',
      delete: '删除了任务',
    };
    return actionMap[log.action] || log.action;
  };

  const groupedTasks: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    closed: [],
  };

  tasks.forEach((task) => {
    if (groupedTasks[task.status]) {
      groupedTasks[task.status].push(task);
    }
  });

  const typeInfo = (type: TaskType) => TASK_TYPE_OPTIONS.find((o) => o.value === type);
  const priorityInfo = (priority: TaskPriority) => TASK_PRIORITY_OPTIONS.find((o) => o.value === priority);
  const statusInfo = (status: TaskStatus) => TASK_STATUS_OPTIONS.find((o) => o.value === status);

  const taskStats = {
    total: tasks.length,
    todo: groupedTasks.todo.length,
    inProgress: groupedTasks.in_progress.length,
    done: groupedTasks.done.length,
    closed: groupedTasks.closed.length,
  };

  if (!project) {
    return <Empty description="项目不存在" />;
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回列表
          </Button>
          <h2 style={{ margin: 0 }}>{project.name}</h2>
          <Tag color={project.status === 'active' ? 'processing' : 'default'}>
            {project.status === 'active' ? '进行中' : '已归档'}
          </Tag>
        </Space>
        <Descriptions column={4} size="small">
          <Descriptions.Item label="项目类型">
            {PROJECT_TYPE_OPTIONS.find((o) => o.value === project.type)?.label}
          </Descriptions.Item>
          <Descriptions.Item label="负责人">{project.manager}</Descriptions.Item>
          <Descriptions.Item label="起止时间">
            {project.startDate} ~ {project.endDate}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(project.createdAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
        </Descriptions>
        {project.description && (
          <p style={{ marginTop: 16, color: '#666' }}>{project.description}</p>
        )}

        <Row gutter={16} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Col span={6}>
            <div style={{ color: '#8c8c8c', fontSize: 13 }}>任务总数</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{taskStats.total}</div>
          </Col>
          <Col span={6}>
            <div style={{ color: '#8c8c8c', fontSize: 13 }}>待处理</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>{taskStats.todo}</div>
          </Col>
          <Col span={6}>
            <div style={{ color: '#8c8c8c', fontSize: 13 }}>进行中</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}>{taskStats.inProgress}</div>
          </Col>
          <Col span={6}>
            <div style={{ color: '#8c8c8c', fontSize: 13 }}>已完成</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{taskStats.done}</div>
          </Col>
        </Row>
      </Card>

      <Card
        title="任务看板"
        extra={
          <Space>
            <Button onClick={() => setIncludeArchived(!includeArchived)}>
              {includeArchived ? '隐藏归档' : '显示归档'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
              新建任务
            </Button>
          </Space>
        }
      >
        <div className="kanban-container">
          {TASK_STATUS_OPTIONS.map((statusOpt) => (
            <div key={statusOpt.value} className={`kanban-column kanban-column-${statusOpt.value}`}>
              <div className="kanban-column-header">
                {statusOpt.label} ({groupedTasks[statusOpt.value].length})
              </div>
              <div className="kanban-task-list">
                {groupedTasks[statusOpt.value].length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />
                ) : (
                  groupedTasks[statusOpt.value].map((task) => (
                    <Dropdown
                      key={task.id}
                      menu={getTaskMenu(task)}
                      trigger={['contextMenu']}
                      placement="bottomRight"
                    >
                      <div
                        className={`kanban-task-card ${task.isPinned ? 'pinned' : ''}`}
                        onClick={() => handleViewTask(task)}
                        style={task.isArchived ? { opacity: 0.6 } : undefined}
                      >
                        <div className="task-card-title">{task.title}</div>
                        <Space size={[4, 4]} wrap>
                          <Tag color={typeInfo(task.type)?.color} style={{ margin: 0 }}>
                            {typeInfo(task.type)?.label}
                          </Tag>
                          <Tag color={priorityInfo(task.priority)?.color} style={{ margin: 0 }}>
                            {priorityInfo(task.priority)?.label}
                          </Tag>
                        </Space>
                        <div className="task-card-meta" style={{ marginTop: 8 }}>
                          <span>{task.assignee}</span>
                          {task.dueDate && (
                            <span style={{ color: dayjs(task.dueDate).isBefore(dayjs()) ? '#ff4d4f' : undefined }}>
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </Dropdown>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitTask}>
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="任务类型"
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select
                  options={TASK_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="任务状态"
                rules={[{ required: true, message: '请选择任务状态' }]}
              >
                <Select
                  options={TASK_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select
                  options={TASK_PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="iteration" label="所属迭代">
                <Input placeholder="如：Sprint 1" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="经办人"
                rules={[{ required: true, message: '请输入经办人' }]}
              >
                <Input placeholder="请输入经办人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reporter"
                label="报告人"
                rules={[{ required: true, message: '请输入报告人' }]}
              >
                <Input placeholder="请输入报告人" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dueDate" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setTaskModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          selectedTask && (
            <Space>
              <Popconfirm
                title="确定删除此任务吗？"
                onConfirm={() => handleDeleteTask(selectedTask)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
              <Button
                icon={selectedTask.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
                onClick={() => handlePinToggle(selectedTask)}
              >
                {selectedTask.isPinned ? '取消置顶' : '置顶'}
              </Button>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => handleArchiveToggle(selectedTask)}
              >
                {selectedTask.isArchived ? '取消归档' : '归档'}
              </Button>
              <Button type="primary" onClick={() => handleEditTask(selectedTask)}>
                编辑
              </Button>
            </Space>
          )
        }
        destroyOnClose
        width={700}
        className="task-detail-modal"
      >
        {selectedTask && (
          <div>
            <Space style={{ marginBottom: 16 }} wrap>
              <Tag color={typeInfo(selectedTask.type)?.color}>
                {typeInfo(selectedTask.type)?.label}
              </Tag>
              <Tag color={priorityInfo(selectedTask.priority)?.color}>
                {priorityInfo(selectedTask.priority)?.label}
              </Tag>
              <Tag color={statusInfo(selectedTask.status)?.color}>
                {statusInfo(selectedTask.status)?.label}
              </Tag>
              {selectedTask.isPinned && <Tag color="gold">已置顶</Tag>}
              {selectedTask.isArchived && <Tag>已归档</Tag>}
            </Space>
            <h3 style={{ marginBottom: 16 }}>{selectedTask.title}</h3>

            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="经办人">{selectedTask.assignee}</Descriptions.Item>
              <Descriptions.Item label="报告人">{selectedTask.reporter}</Descriptions.Item>
              <Descriptions.Item label="截止日期">
                {selectedTask.dueDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属迭代">
                {selectedTask.iteration || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedTask.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(selectedTask.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>任务描述</h4>
              <p style={{ whiteSpace: 'pre-wrap', color: '#666' }}>
                {selectedTask.description || '暂无描述'}
              </p>
            </div>

            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>
                <HistoryOutlined style={{ marginRight: 8 }} />
                操作日志
              </h4>
              <Timeline className="log-timeline">
                {taskLogs.map((log) => (
                  <Timeline.Item key={log.id}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{log.operator}</span>{' '}
                      {getLogActionText(log)}
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
                        {dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProjectDetail;
