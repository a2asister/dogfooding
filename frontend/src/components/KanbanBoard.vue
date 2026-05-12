<template>
  <div class="kanban-board">
    <div class="board-header">
      <h1>Kanban Board</h1>
      <button class="add-task-btn" @click="showAddModal = true">+ Add Task</button>
    </div>
    
    <div class="columns-container">
      <KanbanColumn
        v-for="column in columns"
        :key="column.status"
        :column="column"
        :tasks="getTasksByStatus(column.status)"
        :dragged-task-id="draggedTaskId"
        @task-drop="handleTaskDrop"
        @task-drag-start="handleDragStart"
        @task-drag-end="handleDragEnd"
      />
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add New Task</h3>
        <input v-model="newTask.title" type="text" placeholder="Task title" class="input-field" />
        <textarea v-model="newTask.description" placeholder="Description" class="textarea-field" />
        <select v-model="newTask.priority" class="select-field">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select v-model="newTask.status" class="select-field">
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
        <div class="modal-actions">
          <button @click="showAddModal = false" class="cancel-btn">Cancel</button>
          <button @click="addTask" class="save-btn">Add Task</button>
        </div>
      </div>
    </div>

    <Confetti v-if="showConfetti" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import gql from 'graphql-tag';
import KanbanColumn from './KanbanColumn.vue';
import Confetti from './Confetti.vue';
import { Task, TaskStatus, TaskPriority } from '../types/task';

const GET_TASKS = gql`
  query {
    tasks {
      id
      title
      description
      status
      priority
      order
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation($title: String!, $description: String, $status: TaskStatus, $priority: TaskPriority) {
    createTask(createTaskInput: { title: $title, description: $description, status: $status, priority: $priority }) {
      id
      title
      description
      status
      priority
    }
  }
`;

const UPDATE_TASK = gql`
  mutation($id: ID!, $status: TaskStatus!, $order: Int!) {
    updateTask(updateTaskInput: { id: $id, status: $status, order: $order }) {
      id
      status
      order
    }
  }
`;

@Component({
  components: { KanbanColumn, Confetti },
})
export default class KanbanBoard extends Vue {
  tasks: Task[] = [];
  showAddModal = false;
  showConfetti = false;
  draggedTaskId: string | null = null;
  newTask = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
  };

  columns = [
    { status: TaskStatus.TODO, title: 'To Do', color: '#e74c3c' },
    { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#f39c12' },
    { status: TaskStatus.REVIEW, title: 'Review', color: '#3498db' },
    { status: TaskStatus.DONE, title: 'Done', color: '#27ae60' },
  ];

  mounted() {
    this.fetchTasks();
  }

  async fetchTasks() {
    try {
      const response = await this.$apollo.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only',
      });
      this.tasks = response.data.tasks;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status).sort((a, b) => a.order - b.order);
  }

  handleDragStart(taskId: string) {
    this.draggedTaskId = taskId;
  }

  handleDragEnd() {
    this.draggedTaskId = null;
  }

  async handleTaskDrop({ taskId, newStatus, newOrder }: { taskId: string; newStatus: TaskStatus; newOrder: number }) {
    console.log('Task dropped:', { taskId, newStatus, newOrder });
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const oldStatus = task.status;
    
    try {
      const result = await this.$apollo.mutate({
        mutation: UPDATE_TASK,
        variables: { id: taskId, status: newStatus, order: newOrder },
      });
      console.log('Update result:', result.data);
      await this.fetchTasks();

      if (newStatus === TaskStatus.DONE && oldStatus !== TaskStatus.DONE) {
        this.triggerConfetti();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async addTask() {
    if (!this.newTask.title.trim()) return;
    
    try {
      await this.$apollo.mutate({
        mutation: CREATE_TASK,
        variables: this.newTask,
      });
      this.newTask = { title: '', description: '', priority: TaskPriority.MEDIUM, status: TaskStatus.TODO };
      this.showAddModal = false;
      await this.fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  triggerConfetti() {
    this.showConfetti = true;
    setTimeout(() => {
      this.showConfetti = false;
    }, 3000);
  }
}
</script>

<style scoped>
.kanban-board {
  max-width: 1400px;
  margin: 0 auto;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.board-header h1 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.add-task-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.add-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.columns-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 22px;
}

.input-field,
.textarea-field,
.select-field {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-field:focus,
.textarea-field:focus,
.select-field:focus {
  outline: none;
  border-color: #667eea;
}

.textarea-field {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.cancel-btn {
  background: #ecf0f1;
  border: none;
  color: #7f8c8d;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.cancel-btn:hover,
.save-btn:hover {
  transform: translateY(-2px);
}
</style>
