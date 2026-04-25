export type UserRole = 'admin' | 'medical' | 'charge' | 'patient';

export type Gender = 'male' | 'female' | 'unknown';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PrescriptionStatus = 'pending' | 'approved' | 'dispensed' | 'completed';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export type BedStatus = 'available' | 'occupied' | 'maintenance';

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  departmentId: string;
  title: string;
  specialization: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId?: string;
  name: string;
  gender: Gender;
  birthDate: string;
  idCard: string;
  phone: string;
  address?: string;
  bloodType?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  triageStatus?: 'pending' | 'completed';
  triageNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  chiefComplaint: string;
  presentIllness: string;
  pastHistory: string;
  physicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  status: PrescriptionStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price: number;
  notes?: string;
  createdAt: string;
}

export interface LabTestOrder {
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  testType: string;
  testName: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  result?: string;
  resultDate?: string;
  technicianId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImagingOrder {
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  imagingType: string;
  bodyPart: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  imageUrl?: string;
  report?: string;
  reportDate?: string;
  radiologistId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  unit: string;
  price: number;
  manufacturer?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  medicationId: string;
  batchNumber: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  expiryDate: string;
  location?: string;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  patientId: string;
  appointmentId?: string;
  orderType: 'outpatient' | 'inpatient' | 'pharmacy' | 'lab' | 'imaging';
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentTime?: string;
  insuranceCoverage?: number;
  insuranceClaim?: number;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: 'medication' | 'service' | 'lab' | 'imaging' | 'bed' | 'nursing';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface Ward {
  id: string;
  name: string;
  departmentId: string;
  floor?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  bedType: 'general' | 'icu' | 'vip';
  status: BedStatus;
  dailyRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  bedId: string;
  doctorId: string;
  admissionDate: string;
  dischargeDate?: string;
  admissionReason: string;
  diagnosis?: string;
  status: 'admitted' | 'discharged' | 'transferred';
  totalCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NursingRecord {
  id: string;
  admissionId: string;
  patientId: string;
  nurseId: string;
  recordDate: string;
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  nursingNotes: string;
  interventions?: string;
  createdAt: string;
}

export interface InfectionRisk {
  id: string;
  location: string;
  riskType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'investigating' | 'resolved' | 'closed';
  identifiedBy: string;
  identifiedDate: string;
  investigation?: string;
  investigationDate?: string;
  resolution?: string;
  resolutionDate?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  equipmentType: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  status: 'active' | 'maintenance' | 'retired' | 'broken';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  performedBy: string;
  performedDate: string;
  description: string;
  partsReplaced?: string;
  cost?: number;
  nextMaintenanceDate?: string;
  notes?: string;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  module: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardData {
  todayAppointments: number;
  todayPatients: number;
  todayRevenue: number;
  occupiedBeds: number;
  totalBeds: number;
  lowStockMedications: number;
  pendingLabTests: number;
  pendingImaging: number;
  monthlyRevenue: { month: string; revenue: number }[];
  patientDistribution: { department: string; count: number }[];
  bedOccupancy: { ward: string; occupied: number; total: number }[];
}
