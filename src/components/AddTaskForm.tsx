import { useState } from 'react';
import type { Task, TaskType, MicroTaskType } from '../types/eventLoop';

interface AddTaskFormProps {
  onAddMacroTask: (task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>) => void;
  onAddMicroTask: (task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>) => void;
}

const MACRO_TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'timer', label: 'Timer (setTimeout/setInterval)' },
  { value: 'poll', label: 'Poll (I/O 事件)' },
  { value: 'check', label: 'Check (setImmediate)' },
  { value: 'closeCallbacks', label: 'Close Callbacks' },
  { value: 'pending', label: 'Pending (延迟 I/O)' },
];

const MICRO_TASK_TYPES: { value: MicroTaskType; label: string }[] = [
  { value: 'promise', label: 'Promise (.then/.catch/.finally)' },
  { value: 'nextTick', label: 'process.nextTick' },
  { value: 'queueMicrotask', label: 'queueMicrotask' },
];

export function AddTaskForm({ onAddMacroTask, onAddMicroTask }: AddTaskFormProps) {
  const [taskType, setTaskType] = useState<'macro' | 'micro'>('macro');
  const [selectedType, setSelectedType] = useState<string>('timer');
  const [taskName, setTaskName] = useState('');
  const [delay, setDelay] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) {
      return;
    }

    const task = {
      type: selectedType as TaskType | MicroTaskType,
      name: taskName,
      callback: () => {
        console.log(`任务执行: ${taskName}`);
      },
      delay,
    };

    if (taskType === 'macro') {
      onAddMacroTask(task);
    } else {
      onAddMicroTask(task);
    }

    setTaskName('');
    setDelay(0);
  };

  const typeOptions = taskType === 'macro' ? MACRO_TASK_TYPES : MICRO_TASK_TYPES;

  return (
    <div className="card">
      <div className="card-header">
        <h2>添加任务</h2>
      </div>
      <form className="add-task-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-item">
            <label>任务类型</label>
            <select
              value={taskType}
              onChange={(e) => {
                setTaskType(e.target.value as 'macro' | 'micro');
                const newOptions = e.target.value === 'macro' ? MACRO_TASK_TYPES : MICRO_TASK_TYPES;
                setSelectedType(newOptions[0].value);
              }}
            >
              <option value="macro">宏任务 (Macro Task)</option>
              <option value="micro">微任务 (Micro Task)</option>
            </select>
          </div>
          <div className="form-item">
            <label>具体类型</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-item">
            <label>延迟 (ms)</label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-item" style={{ gridColumn: '1 / -1' }}>
            <label>任务名称</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="输入任务描述..."
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          ➕ 添加任务
        </button>
      </form>
    </div>
  );
}
