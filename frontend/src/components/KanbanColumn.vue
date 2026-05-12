<template>
  <div
    class="kanban-column"
    @dragover.prevent="handleDragOver"
    @drop="handleDrop"
    @dragleave="handleDragLeave"
    :class="{ 'drag-over': isDragOver }"
  >
    <div class="column-header" :style="{ borderLeftColor: column.color }">
      <h2>{{ column.title }}</h2>
      <span class="task-count">{{ tasks.length }}</span>
    </div>
    
    <div class="tasks-list">
      <TaskCard
        v-for="(task, index) in tasks"
        :key="task.id"
        :task="task"
        :columnColor="column.color"
        :index="index"
        :isLast="index === tasks.length - 1"
        @drag-start="handleTaskDragStart"
        @drag-end="handleTaskDragEnd"
      />
      
      <div v-if="tasks.length === 0" class="empty-state">
        <p>No tasks yet</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import TaskCard from './TaskCard.vue';
import { Task, TaskStatus } from '../types/task';

interface Column {
  status: TaskStatus;
  title: string;
  color: string;
}

@Component({ components: { TaskCard } })
export default class KanbanColumn extends Vue {
  @Prop({ required: true }) column!: Column;
  @Prop({ required: true }) tasks!: Task[];
  @Prop({ required: true }) draggedTaskId!: string | null;
  
  isDragOver = false;

  handleTaskDragStart(taskId: string) {
    this.$emit('task-drag-start', taskId);
  }

  handleTaskDragEnd() {
    this.isDragOver = false;
    this.$emit('task-drag-end');
  }

  handleDragOver(e: DragEvent) {
    e.dataTransfer!.dropEffect = 'move';
    this.isDragOver = true;
  }

  handleDragLeave() {
    this.isDragOver = false;
  }

  handleDrop() {
    this.isDragOver = false;
    if (this.draggedTaskId) {
      this.$emit('task-drop', {
        taskId: this.draggedTaskId,
        newStatus: this.column.status,
        newOrder: this.tasks.length,
      });
    }
  }
}
</script>

<style scoped>
.kanban-column {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  min-height: 500px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.kanban-column.drag-over {
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  transform: scale(1.02);
}

.column-header {
  padding: 20px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid;
  border-radius: 12px 12px 0 0;
}

.column-header h2 {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.task-count {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #7f8c8d;
}

.tasks-list {
  padding: 15px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #bdc3c7;
  font-size: 14px;
}
</style>
