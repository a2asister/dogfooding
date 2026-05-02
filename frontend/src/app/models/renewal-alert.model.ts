export interface RenewalAlert {
  id: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractName: string;
  expiryDate: string;
  alertType: string;
  alertLevel: '高' | '中' | '低';
  daysUntilExpiry: number;
  status: string;
  assignedTo: string;
  lastContactDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}
