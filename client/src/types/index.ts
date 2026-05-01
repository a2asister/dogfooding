export type ContractStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'pending_signature' 
  | 'signed' 
  | 'performance' 
  | 'expired' 
  | 'archived' 
  | 'terminated';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Signature {
  id: string;
  party: string;
  signerName: string;
  signatureDate: string;
  signatureImage?: string;
}

export interface ApprovalStep {
  id: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface Contract {
  id: string;
  title: string;
  type: string;
  content: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  partyA: string;
  partyB: string;
  amount: number;
  signatures: Signature[];
  approvalHistory: ApprovalStep[];
  currentApprover?: string;
  archiveId?: string;
  riskLevel?: RiskLevel;
  riskAnalysis?: string;
}

export interface PerformanceRecord {
  id: string;
  contractId: string;
  type: 'payment' | 'delivery' | 'milestone';
  description: string;
  amount?: number;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  notes?: string;
}

export interface Archive {
  id: string;
  contractId: string;
  archiveDate: string;
  location: string;
  keywords: string[];
  accessLevel: 'public' | 'internal' | 'confidential';
  archiveBy: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'employee' | 'legal';
  email: string;
  department: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const contractStatusMap: Record<ContractStatus, { label: string; type: string }> = {
  draft: { label: '草稿', type: 'info' },
  pending_approval: { label: '待审批', type: 'warning' },
  approved: { label: '已审批', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  pending_signature: { label: '待签章', type: 'warning' },
  signed: { label: '已签署', type: 'success' },
  performance: { label: '履约中', type: 'primary' },
  expired: { label: '已过期', type: 'info' },
  archived: { label: '已归档', type: '' },
  terminated: { label: '已终止', type: 'danger' }
};

export const riskLevelMap: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: '低风险', color: '#67C23A' },
  medium: { label: '中等风险', color: '#E6A23C' },
  high: { label: '高风险', color: '#F56C6C' },
  critical: { label: '极高风险', color: '#909399' }
};
