<template>
  <div
    class="task-card"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :class="{
      'is-dragging': isDragging,
      'is-completed': task.status === 'DONE',
      [`priority-${task.priority.toLowerCase()}`]: true,
    }"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <div class="card-content">
      <div class="card-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <span class="priority-badge">{{ task.priority }}</span>
      </div>
      <p v-if="task.description" class="task-description">{{ task.description }}</p>
      <div class="card-footer">
        <span class="status-indicator" :style="{ backgroundColor: statusColor }"></span>
        <span class="created-time">{{ formatTime(task.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Task, TaskStatus } from '../types/task';

@Component
export default class TaskCard extends Vue {
  @Prop({ required: true }) task!: Task;
  @Prop({ required: true }) columnColor!: string;
  @Prop({ required: true }) index!: number;
  @Prop({ required: true }) isLast!: boolean;

  isDragging = false;

  get statusColor(): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: '#e74c3c',
      [TaskStatus.IN_PROGRESS]: '#f39c12',
      [TaskStatus.REVIEW]: '#3498db',
      [TaskStatus.DONE]: '#27ae60',
    };
    return colors[this.task.status];
  }

  handleDragStart(e: DragEvent) {
    this.isDragging = true;
    e.dataTransfer!.effectAllowed = 'move';
    this.$emit('drag-start', this.task.id);
  }

  handleDragEnd() {
    this.isDragging = false;
    this.$emit('drag-end');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  border-left: 4px solid;
  border-color: transparent;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.task-card.is-dragging {
  cursor: grabbing;
  opacity: 0.5;
  transform: rotate(-3deg) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.task-card.is-completed {
  animation: completeShrink 0.6s ease forwards;
}

@keyframes completeShrink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.task-card.priority-high {
  border-left-color: #e74c3c;
}

.task-card.priority-high .priority-badge {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  animation: pulseGlow 2s infinite;
}

.task-card.priority-medium {
  border-left-color: #f39c12;
}

.task-card.priority-medium .priority-badge {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.task-card.priority-low {
  border-left-color: #27ae60;
}

.task-card.priority-low .priority-badge {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(231, 76, 60, 0);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.priority-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  white-space: nowrap;
}

.task-description {
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.5s ease;
}

.created-time {
  font-size: 12px;
  color: #bdc3c7;
}
</style>
