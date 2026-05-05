import request from './request'
import type { Position } from './robot'

export interface Obstacle {
  id: string
  position: Position
  type: 'static' | 'dynamic'
  size: number
}

export interface ObstacleDetectionResult {
  obstacles: Obstacle[]
  safePath: Position[]
  isSafe: boolean
}

export interface CreateObstacleDto {
  position: Position
  type?: 'static' | 'dynamic'
  size?: number
}

export interface CheckObstacleDto {
  start: Position
  end: Position
  safetyMargin?: number
}

export const obstacleApi = {
  getObstacles: (): Promise<Obstacle[]> => {
    return request.get('/obstacles')
  },

  getDynamicObstacles: (): Promise<Obstacle[]> => {
    return request.get('/obstacles/dynamic')
  },

  addObstacle: (data: CreateObstacleDto): Promise<Obstacle> => {
    return request.post('/obstacles', data)
  },

  removeObstacle: (id: string): Promise<void> => {
    return request.delete(`/obstacles/${id}`)
  },

  checkPathForObstacles: (data: CheckObstacleDto): Promise<ObstacleDetectionResult> => {
    return request.post('/obstacles/check', data)
  },

  updateDynamicObstacles: (): Promise<void> => {
    return request.post('/obstacles/update-dynamic')
  },
}
