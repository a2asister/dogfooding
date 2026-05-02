export interface Customer {
  id: string;
  name: string;
  industry: string;
  size: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  level: 'A' | 'B' | 'C' | 'D';
  status: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}
