export type NodeStatus = 'pending' | 'current' | 'approved' | 'rejected';

export interface ApprovalNode {
  id: number;
  name: string;
  role: string;
  approver?: string;
  status: NodeStatus;
  order: number;
  comment?: string;
  approvedAt?: string;
}

export interface ApprovalProcess {
  id: number;
  name: string;
  description: string;
  nodes: ApprovalNode[];
}
