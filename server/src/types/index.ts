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
