export interface ChemicalSubstance {
  formula: string
  name: string
  color: string
  coefficient?: number
}

export interface EquationRecord {
  id: number
  equation: string
  balancedEquation: string
  isCorrect: boolean
  attempts: number
  timeSpent: number
  createdAt: string
}

export interface StatisticsData {
  totalAttempts: number
  correctCount: number
  accuracy: number
  avgTimeSpent: number
  difficultEquations: EquationRecord[]
  recentRecords: EquationRecord[]
}
