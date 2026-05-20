import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Tabs,
  Table,
  Progress,
  Radio,
  List,
  Avatar,
  Statistic,
  Divider,
} from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  PushpinOutlined,
  PushpinFilled,
  FolderOpenOutlined,
  DeleteOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RocketOutlined,
  TagsOutlined,
  DragOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  Project,
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskLog,
  Sprint,
  SprintStatus,
  BacklogItem,
  BacklogItemType,
  BacklogItemStatus,
  Version,
  VersionType,
  VersionStatus,
  User,
} from '../types';
import {
  projectApi,
  taskApi,
  sprintApi,
  backlogApi,
  versionApi,
  userApi,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SPRINT_STATUS_OPTIONS,
  VERSION_TYPE_OPTIONS,
  VERSION_STATUS_OPTIONS,
  BACKLOG_TYPE_OPTIONS,
  BACKLOG_STATUS_OPTIONS,
} from '../types';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

type ViewMode = 'kanban' | 'list';

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [sprintModalVisible, setSprintModalVisible] = useState(false);
  const [backlogModalVisible, setBacklogModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versionDetailVisible, setVersionDetailVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [editingBacklog, setEditingBacklog] = useState<BacklogItem | null>(null);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [taskForm] = Form.useForm();
  const [sprintForm] = Form.useForm();
  const [backlogForm] = Form.useForm();
  const [versionForm] = Form.useForm();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

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

  const fetchSprints = async () => {
    if (!id) return;
    try {
      const res = await sprintApi.getSprints({ projectId: id });
      if (res.code === 0) {
        setSprints(res.data);
        if (res.data.length > 0 && !selectedSprintId) {
          const activeSprint = res.data.find((s) => s.status === 'active');
          setSelectedSprintId(activeSprint?.id || res.data[0].id);
        }
      }
    } catch (err) {
      message.error('获取迭代列表失败');
    }
  };

  const fetchBacklogItems = async () => {
    if (!id) return;
    try {
      const res = await backlogApi.getBacklogItems({ projectId: id });
      if (res.code === 0) {
        setBacklogItems(res.data.sort((a, b) => a.sort - b.sort));
      }
    } catch (err) {
      message.error('获取待办列表失败');
    }
  };

  const fetchVersions = async () => {
    if (!id) return;
    try {
      const res = await versionApi.getVersions({ projectId: id });
      if (res.code === 0) {
        setVersions(res.data);
      }
    } catch (err) {
      message.error('获取版本列表失败');
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      if (TASK_STATUS_OPTIONS.some((opt) => opt.value === overId)) {
        const newStatus = overId as TaskStatus;
        if (activeTask.status === newStatus) return;

        try {
          const res = await taskApi.updateTask(id!, activeId, {
            status: newStatus,
            operator: currentUser?.realName || '',
          });
          if (res.code === 0) {
            setTasks((prev) =>
              prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
            );
            message.success(`已将任务移至「${statusInfo(newStatus)?.label}」`);
          }
        } catch (err) {
          message.error('更新任务状态失败');
        }
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;

        const oldIndex = tasks.findIndex((t) => t.id === activeId);
        const newIndex = tasks.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex && activeTask.status === overTask.status) {
          const newTasks = arrayMove(tasks, oldIndex, newIndex);
          setTasks(newTasks);
        }
      }
    },
    [tasks, id, currentUser]
  );

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
    fetchSprints();
    fetchBacklogItems();
    fetchVersions();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, includeArchived]);

  const handleCreateTask = () => {
    setEditingTask(null);
    taskForm.resetFields();
    taskForm.setFieldsValue({
      type: 'task',
      status: 'todo',
      priority: 'medium',
      reporter: currentUser?.realName || '',
      assignee: currentUser?.realName || '',
    });
    setTaskModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    taskForm.setFieldsValue({
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
    sprintId: string;
    versionId: string;
    storyPoints: number;
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
        sprintId: values.sprintId || null,
        versionId: values.versionId || null,
        storyPoints: values.storyPoints || 0,
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

  const handleCreateSprint = () => {
    setEditingSprint(null);
    sprintForm.resetFields();
    setSprintModalVisible(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    sprintForm.setFieldsValue({
      ...sprint,
      dateRange: [dayjs(sprint.startDate), dayjs(sprint.endDate)],
    });
    setSprintModalVisible(true);
  };

  const handleSubmitSprint = async (values: {
    name: string;
    goal: string;
    dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    if (!id) return;
    try {
      const sprintData = {
        projectId: id,
        name: values.name,
        goal: values.goal,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };

      if (editingSprint) {
        const res = await sprintApi.updateSprint(editingSprint.id, sprintData);
        if (res.code === 0) {
          message.success('迭代更新成功');
          setSprintModalVisible(false);
          fetchSprints();
        }
      } else {
        const res = await sprintApi.createSprint(sprintData);
        if (res.code === 0) {
          message.success('迭代创建成功');
          setSprintModalVisible(false);
          fetchSprints();
        }
      }
    } catch (err) {
      message.error(editingSprint ? '更新失败' : '创建失败');
    }
  };

  const handleSprintStatusChange = async (sprint: Sprint, action: 'start' | 'pause' | 'resume' | 'complete') => {
    try {
      let res;
      switch (action) {
        case 'start':
          res = await sprintApi.startSprint(sprint.id);
          break;
        case 'pause':
          res = await sprintApi.pauseSprint(sprint.id);
          break;
        case 'resume':
          res = await sprintApi.resumeSprint(sprint.id);
          break;
        case 'complete':
          res = await sprintApi.completeSprint(sprint.id);
          break;
      }
      if (res?.code === 0) {
        message.success('操作成功');
        fetchSprints();
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    try {
      const res = await sprintApi.deleteSprint(sprint.id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchSprints();
        if (selectedSprintId === sprint.id) {
          setSelectedSprintId(null);
        }
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleCreateBacklog = () => {
    setEditingBacklog(null);
    backlogForm.resetFields();
    backlogForm.setFieldsValue({
      type: 'feature',
      priority: 'medium',
      reporter: currentUser?.realName || '',
      storyPoints: 0,
    });
    setBacklogModalVisible(true);
  };

  const handleEditBacklog = (item: BacklogItem) => {
    setEditingBacklog(item);
    backlogForm.setFieldsValue(item);
    setBacklogModalVisible(true);
  };

  const handleSubmitBacklog = async (values: {
    title: string;
    description: string;
    type: BacklogItemType;
    priority: TaskPriority;
    storyPoints: number;
    assignee: string;
    reporter: string;
  }) => {
    if (!id) return;
    try {
      const backlogData = {
        projectId: id,
        title: values.title,
        description: values.description || '',
        type: values.type,
        priority: values.priority,
        storyPoints: values.storyPoints || 0,
        assignee: values.assignee || null,
        reporter: values.reporter,
      };

      if (editingBacklog) {
        const res = await backlogApi.updateBacklogItem(editingBacklog.id, backlogData);
        if (res.code === 0) {
          message.success('更新成功');
          setBacklogModalVisible(false);
          fetchBacklogItems();
        }
      } else {
        const res = await backlogApi.createBacklogItem(backlogData);
        if (res.code === 0) {
          message.success('创建成功');
          setBacklogModalVisible(false);
          fetchBacklogItems();
        }
      }
    } catch (err) {
      message.error(editingBacklog ? '更新失败' : '创建失败');
    }
  };

  const handleBatchDeleteBacklog = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const res = await backlogApi.batchDelete(selectedRowKeys as string[]);
      if (res.code === 0) {
        message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
        setSelectedRowKeys([]);
        fetchBacklogItems();
      }
    } catch (err) {
      message.error('批量删除失败');
    }
  };

  const handleBatchUpdateStatus = async (status: BacklogItemStatus) => {
    if (selectedRowKeys.length === 0) return;
    try {
      const res = await backlogApi.batchUpdateStatus(selectedRowKeys as string[], status);
      if (res.code === 0) {
        message.success('状态更新成功');
        setSelectedRowKeys([]);
        fetchBacklogItems();
      }
    } catch (err) {
      message.error('批量更新失败');
    }
  };

  const handleAddToSprint = async (item: BacklogItem, sprintId: string) => {
    try {
      const res = await backlogApi.addToSprint(item.id, sprintId);
      if (res.code === 0) {
        message.success('已添加到迭代');
        fetchBacklogItems();
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleConvertToTask = async (item: BacklogItem) => {
    try {
      const res = await backlogApi.convertToTask(item.id);
      if (res.code === 0) {
        message.success('已转换为任务');
        fetchBacklogItems();
        fetchTasks();
      }
    } catch (err) {
      message.error('转换失败');
    }
  };

  const handleDeleteBacklog = async (item: BacklogItem) => {
    try {
      const res = await backlogApi.deleteBacklogItem(item.id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchBacklogItems();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleCreateVersion = () => {
    setEditingVersion(null);
    versionForm.resetFields();
    versionForm.setFieldsValue({
      type: 'sprint',
    });
    setVersionModalVisible(true);
  };

  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    versionForm.setFieldsValue({
      ...version,
      releaseDate: version.releaseDate ? dayjs(version.releaseDate) : null,
    });
    setVersionModalVisible(true);
  };

  const handleSubmitVersion = async (values: {
    name: string;
    type: VersionType;
    releaseDate?: dayjs.Dayjs;
    description: string;
  }) => {
    if (!id) return;
    try {
      const versionData = {
        projectId: id,
        name: values.name,
        type: values.type,
        status: 'planning' as VersionStatus,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        description: values.description || '',
      };

      if (editingVersion) {
        const res = await versionApi.updateVersion(editingVersion.id, versionData);
        if (res.code === 0) {
          message.success('版本更新成功');
          setVersionModalVisible(false);
          fetchVersions();
        }
      } else {
        const res = await versionApi.createVersion(versionData);
        if (res.code === 0) {
          message.success('版本创建成功');
          setVersionModalVisible(false);
          fetchVersions();
        }
      }
    } catch (err) {
      message.error(editingVersion ? '更新失败' : '创建失败');
    }
  };

  const handleViewVersion = async (version: Version) => {
    setSelectedVersion(version);
    setVersionDetailVisible(true);
  };

  const handleDeleteVersion = async (version: Version) => {
    try {
      const res = await versionApi.deleteVersion(version.id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchVersions();
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

  const typeInfo = (type: TaskType) => TASK_TYPE_OPTIONS.find((o) => o.value === type);
  const priorityInfo = (priority: TaskPriority) => TASK_PRIORITY_OPTIONS.find((o) => o.value === priority);
  const statusInfo = (status: TaskStatus) => TASK_STATUS_OPTIONS.find((o) => o.value === status);
  const sprintStatusInfo = (status: SprintStatus) => SPRINT_STATUS_OPTIONS.find((o) => o.value === status);
  const backlogTypeInfo = (type: BacklogItemType) => BACKLOG_TYPE_OPTIONS.find((o) => o.value === type);
  const backlogStatusInfo = (status: BacklogItemStatus) => BACKLOG_STATUS_OPTIONS.find((o) => o.value === status);
  const versionTypeInfo = (type: VersionType) => VERSION_TYPE_OPTIONS.find((o) => o.value === type);
  const versionStatusInfo = (status: VersionStatus) => VERSION_STATUS_OPTIONS.find((o) => o.value === status);

  const groupedTasks: Record<TaskStatus, Task[]> = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
      closed: [],
    };
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const sprintTasks = useMemo(() => {
    if (!selectedSprintId) return [];
    return tasks.filter((t) => t.sprintId === selectedSprintId);
  }, [tasks, selectedSprintId]);

  const currentSprint = useMemo(() => {
    return sprints.find((s) => s.id === selectedSprintId);
  }, [sprints, selectedSprintId]);

  const sprintStats = useMemo(() => {
    const total = sprintTasks.length;
    const completed = sprintTasks.filter((t) => t.status === 'done' || t.status === 'closed').length;
    const remaining = total - completed;
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, totalPoints, progress };
  }, [sprintTasks]);

  const taskStats = useMemo(() => ({
    total: tasks.length,
    todo: groupedTasks.todo.length,
    inProgress: groupedTasks.in_progress.length,
    done: groupedTasks.done.length,
    closed: groupedTasks.closed.length,
  }), [tasks, groupedTasks]);

  const versionTasks = useMemo(() => {
    if (!selectedVersion) return [];
    return tasks.filter((t) => t.versionId === selectedVersion.id);
  }, [tasks, selectedVersion]);

  const SortableTaskCard = ({ task }: { task: Task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Dropdown
          menu={getTaskMenu(task)}
          trigger={['contextMenu']}
          placement="bottomRight"
        >
          <div
            className={`kanban-task-card ${task.isPinned ? 'pinned' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleViewTask(task);
            }}
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
              {task.storyPoints > 0 && (
                <Tag color="purple" style={{ margin: 0 }}>
                  {task.storyPoints} SP
                </Tag>
              )}
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
      </div>
    );
  };

  const DroppableColumn = ({
    status,
    label,
    tasks,
  }: {
    status: TaskStatus;
    label: string;
    tasks: Task[];
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status,
    });

    return (
      <div
        key={status}
        className={`kanban-column kanban-column-${status}`}
        style={{
          backgroundColor: isOver ? 'rgba(24, 144, 255, 0.05)' : undefined,
          transition: 'background-color 0.2s',
        }}
      >
        <div className="kanban-column-header">
          {label} ({tasks.length})
        </div>
        <div ref={setNodeRef} className="kanban-task-list">
          {tasks.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" />
          ) : (
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    );
  };

  const renderKanbanView = () => {
    const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-container">
          {TASK_STATUS_OPTIONS.map((statusOpt) => (
            <DroppableColumn
              key={statusOpt.value}
              status={statusOpt.value as TaskStatus}
              label={statusOpt.label}
              tasks={groupedTasks[statusOpt.value as TaskStatus]}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div
              className="kanban-task-card"
              style={{
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                transform: 'rotate(2deg)',
              }}
            >
              <div className="task-card-title">{activeTask.title}</div>
              <Space size={[4, 4]} wrap>
                <Tag color={typeInfo(activeTask.type)?.color} style={{ margin: 0 }}>
                  {typeInfo(activeTask.type)?.label}
                </Tag>
                <Tag color={priorityInfo(activeTask.priority)?.color} style={{ margin: 0 }}>
                  {priorityInfo(activeTask.priority)?.label}
                </Tag>
              </Space>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  const renderListView = () => {
    const columns = [
      {
        title: '任务标题',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: Task) => (
          <a onClick={() => handleViewTask(record)}>{text}</a>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (type: TaskType) => (
          <Tag color={typeInfo(type)?.color}>{typeInfo(type)?.label}</Tag>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        render: (priority: TaskPriority) => (
          <Tag color={priorityInfo(priority)?.color}>{priorityInfo(priority)?.label}</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: TaskStatus) => (
          <Tag color={statusInfo(status)?.color}>{statusInfo(status)?.label}</Tag>
        ),
      },
      {
        title: '故事点',
        dataIndex: 'storyPoints',
        key: 'storyPoints',
        width: 80,
        render: (points: number) => points || '-',
      },
      {
        title: '经办人',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 100,
      },
      {
        title: '截止日期',
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 120,
        render: (date: string) => date || '-',
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_: unknown, record: Task) => (
          <Space>
            <Button size="small" onClick={() => handleEditTask(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除吗？" onConfirm={() => handleDeleteTask(record)}>
              <Button size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    );
  };

  const renderSprintManagement = () => (
    <div>
      <Card
        title="迭代管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSprint}>
            新建迭代
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {sprints.length === 0 ? (
          <Empty description="暂无迭代" />
        ) : (
          <Row gutter={[16, 16]}>
            {sprints.map((sprint) => (
              <Col span={24} key={sprint.id}>
                <Card
                  hoverable
                  onClick={() => setSelectedSprintId(sprint.id)}
                  style={{
                    borderColor: selectedSprintId === sprint.id ? '#1890ff' : undefined,
                    borderWidth: selectedSprintId === sprint.id ? 2 : 1,
                  }}
                >
                  <Row align="middle" justify="space-between">
                    <Col span={16}>
                      <Space align="center">
                        <h3 style={{ margin: 0 }}>{sprint.name}</h3>
                        <Tag color={sprintStatusInfo(sprint.status)?.color}>
                          {sprintStatusInfo(sprint.status)?.label}
                        </Tag>
                      </Space>
                      <div style={{ color: '#8c8c8c', marginTop: 8 }}>
                        <Space>
                          <span><ClockCircleOutlined /> {sprint.startDate} ~ {sprint.endDate}</span>
                        </Space>
                      </div>
                      {sprint.goal && (
                        <p style={{ marginTop: 8, marginBottom: 0, color: '#666' }}>
                          目标：{sprint.goal}
                        </p>
                      )}
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      <Space wrap>
                        {sprint.status === 'planning' && (
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSprintStatusChange(sprint, 'start');
                            }}
                          >
                            开启
                          </Button>
                        )}
                        {sprint.status === 'active' && (
                          <Button
                            icon={<PauseCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSprintStatusChange(sprint, 'pause');
                            }}
                          >
                            暂停
                          </Button>
                        )}
                        {sprint.status === 'paused' && (
                          <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSprintStatusChange(sprint, 'resume');
                            }}
                          >
                            恢复
                          </Button>
                        )}
                        {(sprint.status === 'active' || sprint.status === 'paused') && (
                          <Button
                            icon={<CheckCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSprintStatusChange(sprint, 'complete');
                            }}
                          >
                            结束
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSprint(sprint);
                          }}
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title="确定删除此迭代吗？"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteSprint(sprint);
                          }}
                        >
                          <Button
                            danger
                            onClick={(e) => e.stopPropagation()}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {currentSprint && (
        <Card title={`${currentSprint.name} - 迭代详情`}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Statistic title="任务总数" value={sprintStats.total} />
            </Col>
            <Col span={6}>
              <Statistic title="已完成" value={sprintStats.completed} valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col span={6}>
              <Statistic title="剩余" value={sprintStats.remaining} valueStyle={{ color: '#fa8c16' }} />
            </Col>
            <Col span={6}>
              <Statistic title="故事点" value={sprintStats.totalPoints} suffix="SP" />
            </Col>
          </Row>
          <Progress percent={sprintStats.progress} style={{ marginBottom: 24 }} />
          <Divider orientation="left">迭代任务</Divider>
          {sprintTasks.length === 0 ? (
            <Empty description="暂无任务" />
          ) : (
            <List
              dataSource={sprintTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button size="small" onClick={() => handleEditTask(task)}>编辑</Button>,
                    <Button
                      size="small"
                      danger
                      onClick={async () => {
                        if (!id) return;
                        try {
                          await taskApi.updateTask(id, task.id, { sprintId: null, operator: '当前用户' });
                          message.success('已移出迭代');
                          fetchTasks();
                        } catch (err) {
                          message.error('操作失败');
                        }
                      }}
                    >
                      移出迭代
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={
                      <Space>
                        <a onClick={() => handleViewTask(task)}>{task.title}</a>
                        <Tag color={typeInfo(task.type)?.color}>{typeInfo(task.type)?.label}</Tag>
                        <Tag color={statusInfo(task.status)?.color}>{statusInfo(task.status)?.label}</Tag>
                      </Space>
                    }
                    description={task.assignee}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );

  const renderBacklogManagement = () => {
    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: BacklogItem) => (
          <Space>
            <DragOutlined style={{ color: '#d9d9d9', cursor: 'move' }} />
            <a onClick={() => handleEditBacklog(record)}>{text}</a>
          </Space>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (type: BacklogItemType) => (
          <Tag color={backlogTypeInfo(type)?.color}>{backlogTypeInfo(type)?.label}</Tag>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        render: (priority: TaskPriority) => (
          <Tag color={priorityInfo(priority)?.color}>{priorityInfo(priority)?.label}</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: BacklogItemStatus) => (
          <Tag color={backlogStatusInfo(status)?.color}>{backlogStatusInfo(status)?.label}</Tag>
        ),
      },
      {
        title: '故事点',
        dataIndex: 'storyPoints',
        key: 'storyPoints',
        width: 80,
        render: (points: number) => points || '-',
      },
      {
        title: '负责人',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 100,
        render: (assignee: string | null) => assignee || '-',
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (_: unknown, record: BacklogItem) => (
          <Space wrap>
            <Dropdown
              menu={{
                items: sprints
                  .filter((s) => s.status === 'active' || s.status === 'planning')
                  .map((s) => ({
                    key: s.id,
                    label: s.name,
                    onClick: () => handleAddToSprint(record, s.id),
                  })),
              }}
              disabled={sprints.filter((s) => s.status === 'active' || s.status === 'planning').length === 0}
            >
              <Button size="small" icon={<RocketOutlined />}>
                拉入迭代
              </Button>
            </Dropdown>
            <Button
              size="small"
              type="primary"
              onClick={() => handleConvertToTask(record)}
            >
              转任务
            </Button>
            <Popconfirm title="确定删除吗？" onConfirm={() => handleDeleteBacklog(record)}>
              <Button size="small" danger>
                删除
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

    return (
      <Card
        title="产品待办池"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBacklog}>
            新建待办
          </Button>
        }
      >
        {selectedRowKeys.length > 0 && (
          <Card style={{ marginBottom: 16, background: '#f5f5f5' }}>
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Dropdown
                menu={{
                  items: BACKLOG_STATUS_OPTIONS.map((s) => ({
                    key: s.value,
                    label: `更新为：${s.label}`,
                    onClick: () => handleBatchUpdateStatus(s.value),
                  })),
                }}
              >
                <Button>批量更新状态</Button>
              </Dropdown>
              <Popconfirm title="确定删除选中的记录吗？" onConfirm={handleBatchDeleteBacklog}>
                <Button danger>批量删除</Button>
              </Popconfirm>
            </Space>
          </Card>
        )}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={backlogItems}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    );
  };

  const renderVersionManagement = () => (
    <Card
      title="版本管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateVersion}>
          新建版本
        </Button>
      }
    >
      {versions.length === 0 ? (
        <Empty description="暂无版本" />
      ) : (
        <Row gutter={[16, 16]}>
          {versions.map((version) => {
            const vTasks = tasks.filter((t) => t.versionId === version.id);
            const doneCount = vTasks.filter((t) => t.status === 'done' || t.status === 'closed').length;
            const progress = vTasks.length > 0 ? Math.round((doneCount / vTasks.length) * 100) : 0;

            return (
              <Col span={8} key={version.id}>
                <Card hoverable onClick={() => handleViewVersion(version)}>
                  <Space align="start" direction="vertical" style={{ width: '100%' }}>
                    <Space align="center">
                      <TagsOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      <h4 style={{ margin: 0 }}>{version.name}</h4>
                      <Tag color={versionStatusInfo(version.status)?.color}>
                        {versionStatusInfo(version.status)?.label}
                      </Tag>
                    </Space>
                    <Tag color={version.type === 'sprint' ? 'blue' : 'green'}>
                      {versionTypeInfo(version.type)?.label}
                    </Tag>
                    {version.releaseDate && (
                      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                        发布日期：{version.releaseDate}
                      </div>
                    )}
                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                        进度：{doneCount}/{vTasks.length} 任务
                      </div>
                      <Progress percent={progress} size="small" />
                    </div>
                  </Space>
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Space>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVersion(version);
                        }}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title="确定删除此版本吗？"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteVersion(version);
                        }}
                      >
                        <Button
                          size="small"
                          danger
                          onClick={(e) => e.stopPropagation()}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Card>
  );

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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <AppstoreOutlined />
              任务看板
            </span>
          }
          key="tasks"
        >
          <Card
            extra={
              <Space>
                <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <Radio.Button value="kanban">
                    <AppstoreOutlined /> 看板视图
                  </Radio.Button>
                  <Radio.Button value="list">
                    <UnorderedListOutlined /> 列表视图
                  </Radio.Button>
                </Radio.Group>
                <Button onClick={() => setIncludeArchived(!includeArchived)}>
                  {includeArchived ? '隐藏归档' : '显示归档'}
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
                  新建任务
                </Button>
              </Space>
            }
          >
            {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <RocketOutlined />
              迭代管理
            </span>
          }
          key="sprints"
        >
          {renderSprintManagement()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <UnorderedListOutlined />
              产品待办
            </span>
          }
          key="backlog"
        >
          {renderBacklogManagement()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <TagOutlined />
              版本管理
            </span>
          }
          key="versions"
        >
          {renderVersionManagement()}
        </TabPane>
      </Tabs>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={taskForm} layout="vertical" onFinish={handleSubmitTask}>
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
              <Form.Item name="storyPoints" label="故事点">
                <Input type="number" min={0} placeholder="请输入故事点" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sprintId" label="所属迭代">
                <Select placeholder="请选择迭代" allowClear>
                  {sprints.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="versionId" label="所属版本">
                <Select placeholder="请选择版本" allowClear>
                  {versions.map((v) => (
                    <Option key={v.id} value={v.id}>
                      {v.name}
                    </Option>
                  ))}
                </Select>
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
                <Select placeholder="请选择经办人">
                  {users.map((u) => (
                    <Option key={u.id} value={u.realName}>
                      {u.realName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reporter"
                label="报告人"
                rules={[{ required: true, message: '请选择报告人' }]}
              >
                <Select placeholder="请选择报告人">
                  {users.map((u) => (
                    <Option key={u.id} value={u.realName}>
                      {u.realName}
                    </Option>
                  ))}
                </Select>
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
              {selectedTask.storyPoints > 0 && (
                <Tag color="purple">{selectedTask.storyPoints} SP</Tag>
              )}
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
              <Descriptions.Item label="故事点">
                {selectedTask.storyPoints || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属迭代">
                {sprints.find((s) => s.id === selectedTask.sprintId)?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属版本">
                {versions.find((v) => v.id === selectedTask.versionId)?.name || '-'}
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

      <Modal
        title={editingSprint ? '编辑迭代' : '新建迭代'}
        open={sprintModalVisible}
        onCancel={() => setSprintModalVisible(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form form={sprintForm} layout="vertical" onFinish={handleSubmitSprint}>
          <Form.Item
            name="name"
            label="迭代名称"
            rules={[{ required: true, message: '请输入迭代名称' }]}
          >
            <Input placeholder="如：Sprint 1" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="起止时间"
            rules={[{ required: true, message: '请选择起止时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="goal" label="迭代目标">
            <TextArea rows={4} placeholder="请输入迭代目标" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setSprintModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingSprint ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingBacklog ? '编辑待办' : '新建待办'}
        open={backlogModalVisible}
        onCancel={() => setBacklogModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={backlogForm} layout="vertical" onFinish={handleSubmitBacklog}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入待办标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select
                  options={BACKLOG_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Form.Item>
            </Col>
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="storyPoints" label="故事点">
                <Input type="number" min={0} placeholder="请输入故事点" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignee" label="负责人">
                <Select placeholder="请选择负责人" allowClear>
                  {users.map((u) => (
                    <Option key={u.id} value={u.realName}>
                      {u.realName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reporter"
            label="报告人"
            rules={[{ required: true, message: '请选择报告人' }]}
          >
            <Select placeholder="请选择报告人">
              {users.map((u) => (
                <Option key={u.id} value={u.realName}>
                  {u.realName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入详细描述" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setBacklogModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingBacklog ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingVersion ? '编辑版本' : '新建版本'}
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form form={versionForm} layout="vertical" onFinish={handleSubmitVersion}>
          <Form.Item
            name="name"
            label="版本名称"
            rules={[{ required: true, message: '请输入版本名称' }]}
          >
            <Input placeholder="如：v1.0.0" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="版本类型"
                rules={[{ required: true, message: '请选择版本类型' }]}
              >
                <Select
                  options={VERSION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="releaseDate" label="发布日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="版本描述">
            <TextArea rows={4} placeholder="请输入版本描述" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setVersionModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingVersion ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="版本详情"
        open={versionDetailVisible}
        onCancel={() => setVersionDetailVisible(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        {selectedVersion && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={versionTypeInfo(selectedVersion.type)?.color || 'blue'}>
                {versionTypeInfo(selectedVersion.type)?.label}
              </Tag>
              <Tag color={versionStatusInfo(selectedVersion.status)?.color}>
                {versionStatusInfo(selectedVersion.status)?.label}
              </Tag>
            </Space>
            <h3 style={{ marginBottom: 16 }}>{selectedVersion.name}</h3>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="发布日期">
                {selectedVersion.releaseDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedVersion.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            {selectedVersion.description && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>版本描述</h4>
                <p style={{ color: '#666' }}>{selectedVersion.description}</p>
              </div>
            )}
            <Divider orientation="left">关联任务</Divider>
            {versionTasks.length === 0 ? (
              <Empty description="暂无关联任务" />
            ) : (
              <List
                dataSource={versionTasks}
                renderItem={(task) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={
                        <Space>
                          <a onClick={() => handleViewTask(task)}>{task.title}</a>
                          <Tag color={typeInfo(task.type)?.color}>{typeInfo(task.type)?.label}</Tag>
                          <Tag color={statusInfo(task.status)?.color}>{statusInfo(task.status)?.label}</Tag>
                        </Space>
                      }
                      description={task.assignee}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProjectDetail;
