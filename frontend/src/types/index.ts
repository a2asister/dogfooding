export interface Medicine {
  id: number;
  name: string;
  image: string;
  dosage: string;
  time: string;
  description: string;
  precautions: string;
  isActive: boolean;
}

export interface MedicineRecord {
  id: number;
  medicineId: number;
  medicine: Medicine;
  scheduledTime: string;
  taken: boolean;
  takenAt: Date | null;
  createdAt: Date;
}
