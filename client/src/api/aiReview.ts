import { request } from './index'
import type { RiskLevel, ApiResponse } from '@/types'

interface RiskRule {
  keyword: string;
  riskLevel: RiskLevel;
  description: string;
  category: string;
}

interface AnalysisResult {
  riskLevel: RiskLevel;
  risks: Array<{
    rule: RiskRule;
    foundCount: number;
  }>;
  analysis: string;
}

export const aiReviewApi = {
  analyze(data: { content: string; contractId?: string }) {
    return request.post<ApiResponse<AnalysisResult>>('/ai-review/analyze', data)
  },

  analyzeContract(id: string) {
    return request.post<ApiResponse<{ contract: any; analysis: AnalysisResult }>>(`/ai-review/analyze-contract/${id}`)
  },

  getRiskLevels() {
    return request.get<ApiResponse<Array<{ level: RiskLevel; name: string; description: string }>>>('/ai-review/risk-levels')
  }
}

export default aiReviewApi
