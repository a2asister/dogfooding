import request from './request'
import type { Position } from './robot'

export interface PathPlanningResult {
  path: Position[]
  distance: number
  found: boolean
}

export interface PlanPathDto {
  start: Position
  end: Position
  obstacles?: Position[]
}

export const pathPlanningApi = {
  planPath: (data: PlanPathDto): Promise<PathPlanningResult> => {
    return request.post('/path-planning/plan', data)
  },

  getMapGrid: (): Promise<{ width: number; height: number; grid: number[][] }> => {
    return request.get('/path-planning/map')
  },
}
