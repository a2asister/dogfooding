import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Plus, X, ChevronDown, ChevronRight, Edit2, Trash2, Check, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Task, Statistics, CreateTaskInput, UpdateTaskInput } from './types';
import { taskApi } from './services/api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<CreateTaskInput>({ title: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    if (containerRef.current) {
      gsap.from(containerRef.current, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' });
    }
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        taskApi.getAll(),
        taskApi.getStatistics(),
      ]);
      setTasks(tasksData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanedData = { ...formData };
      if (!cleanedData.deadline || cleanedData.deadline === '') {
        delete cleanedData.deadline;
      }

      if (editingTask) {
        await taskApi.update(editingTask.id, cleanedData as UpdateTaskInput);
      } else {
        await taskApi.create({ ...cleanedData, parentId });
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        await taskApi.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskApi.update(task.id, { isCompleted: !task.isCompleted });
      await fetchData();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleToggleExpand = async (task: Task) => {
    try {
      await taskApi.update(task.id, { isExpanded: !task.isExpanded });
      await fetchData();
    } catch (error) {
      console.error('Failed to toggle expand:', error);
    }
  };

  const openModal = (task?: Task, parent?: number) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        progress: task.progress,
        weight: task.weight,
        deadline: task.deadline,
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '' });
      setParentId(parent);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setParentId(undefined);
  };

  const renderTask = (task: Task, index: number) => {
    const hasChildren = task.children && task.children.length > 0;
    
    return (
      <div key={task.id} className="task-wrapper">
        <div
          className={`task-card ${task.isCompleted ? 'completed' : ''} ${task.isOverdue ? 'overdue' : ''}`}
          style={{ marginLeft: `${task.level * 24}px` }}
        >
          <div className="task-header">
            <div className="task-left">
              {hasChildren && (
                <button
                  className="expand-btn"
                  onClick={() => handleToggleExpand(task)}
                >
                  {task.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
              {!hasChildren && <div className="expand-placeholder" />}
              <button
                className={`checkbox-btn ${task.isCompleted ? 'checked' : ''}`}
                onClick={() => handleToggleComplete(task)}
              >
                {task.isCompleted && <Check size={14} />}
              </button>
              <span className="task-title">{task.title}</span>
            </div>
            <div className="task-actions">
              <button className="action-btn edit" onClick={() => openModal(task)}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(task.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="task-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="progress-text">{task.progress}%</span>
          </div>

          <div className="task-meta">
            {task.isOverdue && (
              <span className="meta-badge overdue">
                <AlertTriangle size={12} /> 已逾期
              </span>
            )}
            {task.deadline && !task.isOverdue && (
              <span className="meta-badge deadline">
                <Clock size={12} /> {task.deadline?.split('T')[0]}
              </span>
            )}
            <span className="meta-badge weight">
              权重: {task.weight}
            </span>
            <button
              className="add-subtask-btn"
              onClick={() => openModal(undefined, task.id)}
            >
              <Plus size={14} /> 子任务
            </button>
          </div>
        </div>

        {hasChildren && task.isExpanded && (
          <div className="task-children">
            {task.children.map((child, i) => renderTask(child, i))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="kanban-container">
      <header className="kanban-header">
        <h1 className="kanban-title">
          <BarChart3 size={28} />
          层级任务看板
        </h1>
        <button className="add-task-btn" onClick={() => openModal()}>
          <Plus size={20} />
          新建任务
        </button>
      </header>

      {statistics && (
        <div className="statistics-panel">
          <div className="stat-card">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">总任务</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-value">{statistics.completed}</div>
            <div className="stat-label">已完成</div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-value">{statistics.inProgress}</div>
            <div className="stat-label">进行中</div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-value">{statistics.overdue}</div>
            <div className="stat-label">已逾期</div>
          </div>
          <div className="stat-card overall">
            <div className="stat-value">{statistics.overallProgress}%</div>
            <div className="stat-label">总进度</div>
          </div>
        </div>
      )}

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>暂无任务，点击右上角按钮创建第一个任务</p>
          </div>
        ) : (
          tasks.map((task, index) => renderTask(task, index))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? '编辑任务' : '新建任务'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>任务标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="请输入任务标题"
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入任务描述"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>进度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress || 0}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>权重</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.weight || 1}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>截止日期</label>
                <input
                  type="date"
                  value={formData.deadline?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
