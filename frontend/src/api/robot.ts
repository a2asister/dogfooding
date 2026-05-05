import request from './request'

export interface Position {
  x: number
  y: number
}

export interface Robot {
  id: string
  name: string
  status: 'idle' | 'working' | 'charging' | 'error' | 'moving'
  position: Position
  batteryLevel: number
  speed: number
  lastUpdate: string
  currentTaskId?: string
  path?: Position[]
  currentPathIndex?: number
}

export interface CreateRobotDto {
  name: string
  status?: 'idle' | 'working' | 'charging' | 'error' | 'moving'
  position?: Position
  batteryLevel?: number
  speed?: number
}

export const robotApi = {
  getRobots: (): Promise<Robot[]> => {
    return request.get('/robots')
  },

  getRobot: (id: string): Promise<Robot> => {
    return request.get(`/robots/${id}`)
  },

  getAvailableRobots: (): Promise<Robot[]> => {
    return request.get('/robots/available')
  },

  createRobot: (data: CreateRobotDto): Promise<Robot> => {
    return request.post('/robots', data)
  },

  updateRobot: (id: string, data: Partial<Robot>): Promise<Robot> => {
    return request.put(`/robots/${id}`, data)
  },

  deleteRobot: (id: string): Promise<void> => {
    return request.delete(`/robots/${id}`)
  },

  moveRobot: (id: string): Promise<Robot> => {
    return request.put(`/robots/${id}/move`)
  },
}
