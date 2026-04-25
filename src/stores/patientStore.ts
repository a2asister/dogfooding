import { create } from 'zustand';
import { StorageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { useAuthStore } from './authStore';
import type { Patient, Appointment, MedicalRecord, Prescription, PrescriptionItem } from '../types';

interface PatientState {
  patients: Patient[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  prescriptionItems: PrescriptionItem[];

  loadPatients: () => void;
  loadAppointments: () => void;
  loadMedicalRecords: () => void;
  loadPrescriptions: () => void;
  loadPrescriptionItems: () => void;
  loadAll: () => void;

  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => Patient | null;
  deletePatient: (id: string) => boolean;

  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Appointment | null;
  cancelAppointment: (id: string) => boolean;

  addMedicalRecord: (
    record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => MedicalRecord;
  updateMedicalRecord: (
    id: string,
    updates: Partial<MedicalRecord>
  ) => MedicalRecord | null;

  addPrescription: (
    prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>,
    items: Omit<PrescriptionItem, 'id' | 'prescriptionId' | 'createdAt'>[]
  ) => Prescription;
  updatePrescriptionStatus: (
    id: string,
    status: Prescription['status']
  ) => Prescription | null;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  appointments: [],
  medicalRecords: [],
  prescriptions: [],
  prescriptionItems: [],

  loadPatients: () => {
    const patients = StorageService.getAll<Patient>(STORAGE_KEYS.PATIENTS);
    set({ patients });
  },

  loadAppointments: () => {
    const appointments = StorageService.getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    set({ appointments });
  },

  loadMedicalRecords: () => {
    const medicalRecords = StorageService.getAll<MedicalRecord>(STORAGE_KEYS.MEDICAL_RECORDS);
    set({ medicalRecords });
  },

  loadPrescriptions: () => {
    const prescriptions = StorageService.getAll<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);
    set({ prescriptions });
  },

  loadPrescriptionItems: () => {
    const prescriptionItems = StorageService.getAll<PrescriptionItem>(
      STORAGE_KEYS.PRESCRIPTION_ITEMS
    );
    set({ prescriptionItems });
  },

  loadAll: () => {
    get().loadPatients();
    get().loadAppointments();
    get().loadMedicalRecords();
    get().loadPrescriptions();
    get().loadPrescriptionItems();
  },

  addPatient: (patient) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newPatient = StorageService.create<Patient>(STORAGE_KEYS.PATIENTS, patient);
    get().loadPatients();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '患者管理',
        '新增',
        '患者',
        newPatient.id,
        `新增患者: ${newPatient.name}`
      );
    }

    return newPatient;
  },

  updatePatient: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Patient>(STORAGE_KEYS.PATIENTS, id, updates);
    get().loadPatients();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '患者管理',
        '修改',
        '患者',
        id,
        `修改患者信息: ${updated.name}`
      );
    }

    return updated;
  },

  deletePatient: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const patient = StorageService.findById<Patient>(STORAGE_KEYS.PATIENTS, id);
    const success = StorageService.delete(STORAGE_KEYS.PATIENTS, id);
    get().loadPatients();

    if (currentUser && patient && success) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '患者管理',
        '删除',
        '患者',
        id,
        `删除患者: ${patient.name}`
      );
    }

    return success;
  },

  addAppointment: (apt) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newApt = StorageService.create<Appointment>(STORAGE_KEYS.APPOINTMENTS, apt);
    get().loadAppointments();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '预约挂号',
        '新增',
        '预约',
        newApt.id,
        `新增预约: ${newApt.appointmentDate} ${newApt.timeSlot}`
      );
    }

    return newApt;
  },

  updateAppointment: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Appointment>(STORAGE_KEYS.APPOINTMENTS, id, updates);
    get().loadAppointments();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '预约挂号',
        '修改',
        '预约',
        id,
        `修改预约信息`
      );
    }

    return updated;
  },

  cancelAppointment: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const apt = StorageService.findById<Appointment>(STORAGE_KEYS.APPOINTMENTS, id);
    const updated = StorageService.update<Appointment>(STORAGE_KEYS.APPOINTMENTS, id, {
      status: 'cancelled',
    });
    get().loadAppointments();

    if (currentUser && apt && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '预约挂号',
        '取消',
        '预约',
        id,
        `取消预约: ${apt.appointmentDate} ${apt.timeSlot}`
      );
    }

    return !!updated;
  },

  addMedicalRecord: (record) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newRecord = StorageService.create<MedicalRecord>(
      STORAGE_KEYS.MEDICAL_RECORDS,
      record
    );
    get().loadMedicalRecords();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '电子病历',
        '新增',
        '病历',
        newRecord.id,
        `新增电子病历`
      );
    }

    return newRecord;
  },

  updateMedicalRecord: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<MedicalRecord>(
      STORAGE_KEYS.MEDICAL_RECORDS,
      id,
      updates
    );
    get().loadMedicalRecords();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '电子病历',
        '修改',
        '病历',
        id,
        `修改电子病历`
      );
    }

    return updated;
  },

  addPrescription: (prescription, items) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newPrescription = StorageService.create<Prescription>(
      STORAGE_KEYS.PRESCRIPTIONS,
      prescription
    );

    items.forEach((item) => {
      StorageService.create<PrescriptionItem>(STORAGE_KEYS.PRESCRIPTION_ITEMS, {
        ...item,
        prescriptionId: newPrescription.id,
      });
    });

    get().loadPrescriptions();
    get().loadPrescriptionItems();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '处方管理',
        '新增',
        '处方',
        newPrescription.id,
        `新增处方，金额: ¥${newPrescription.totalAmount}`
      );
    }

    return newPrescription;
  },

  updatePrescriptionStatus: (id, status) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Prescription>(STORAGE_KEYS.PRESCRIPTIONS, id, {
      status,
    });
    get().loadPrescriptions();

    if (currentUser && updated) {
      const statusMap: Record<string, string> = {
        pending: '待审核',
        approved: '已审核',
        dispensed: '已发药',
        completed: '已完成',
      };
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '处方管理',
        '状态变更',
        '处方',
        id,
        `处方状态变更为: ${statusMap[status] || status}`
      );
    }

    return updated;
  },
}));
