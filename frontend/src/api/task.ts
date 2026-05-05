import request from './request'
import type { Position } from './robot'

export interface Task {
  id: string
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  startPosition: Position
  targetPosition: Position
  assignedRobotId?: string
  estimatedTime?: number
  actualTime?: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CreateTaskDto {
  name: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  startPosition: Position
  targetPosition: Position
  estimatedTime?: number
}

export const taskApi = {
  getTasks: (): Promise<Task[]> => {
    return request.get('/tasks')
  },

  getTask: (id: string): Promise<Task> => {
    return request.get(`/tasks/${id}`)
  },

  getTasksByStatus: (status: string): Promise<Task[]> => {
    return request.get(`/tasks/status/${status}`)
  },

  getTasksByRobot: (robotId: string): Promise<Task[]> => {
    return request.get(`/tasks/robot/${robotId}`)
  },

  createTask: (data: CreateTaskDto): Promise<Task> => {
    return request.post('/tasks', data)
  },

  updateTask: (id: string, data: Partial<Task>): Promise<Task> => {
    return request.put(`/tasks/${id}`, data)
  },

  deleteTask: (id: string): Promise<void> => {
    return request.delete(`/tasks/${id}`)
  },

  assignTask: (id: string): Promise<Task> => {
    return request.post(`/tasks/${id}/assign`)
  },

  startTask: (id: string): Promise<Task> => {
    return request.post(`/tasks/${id}/start`)
  },

  completeTask: (id: string): Promise<Task> => {
    return request.post(`/tasks/${id}/complete`)
  },

  cancelTask: (id: string): Promise<Task> => {
    return request.post(`/tasks/${id}/cancel`)
  },
}
