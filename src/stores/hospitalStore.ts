import { create } from 'zustand';
import { StorageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { useAuthStore } from './authStore';
import type {
  Department,
  Doctor,
  Ward,
  Bed,
  Medication,
  Equipment,
  User,
} from '../types';

interface HospitalState {
  departments: Department[];
  doctors: Doctor[];
  wards: Ward[];
  beds: Bed[];
  medications: Medication[];
  equipment: Equipment[];
  medicalStaff: User[];

  loadDepartments: () => void;
  loadDoctors: () => void;
  loadWards: () => void;
  loadBeds: () => void;
  loadMedications: () => void;
  loadEquipment: () => void;
  loadMedicalStaff: () => void;
  loadAll: () => void;

  addDepartment: (dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => Department | null;
  deleteDepartment: (id: string) => boolean;

  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Doctor | null;
  deleteDoctor: (id: string) => boolean;

  addMedication: (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => Medication | null;
  deleteMedication: (id: string) => boolean;

  addEquipment: (eq: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Equipment;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Equipment | null;
  deleteEquipment: (id: string) => boolean;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  departments: [],
  doctors: [],
  wards: [],
  beds: [],
  medications: [],
  equipment: [],
  medicalStaff: [],

  loadDepartments: () => {
    const departments = StorageService.getAll<Department>(STORAGE_KEYS.DEPARTMENTS);
    set({ departments });
  },

  loadDoctors: () => {
    const doctors = StorageService.getAll<Doctor>(STORAGE_KEYS.DOCTORS);
    set({ doctors });
  },

  loadWards: () => {
    const wards = StorageService.getAll<Ward>(STORAGE_KEYS.WARDS);
    set({ wards });
  },

  loadBeds: () => {
    const beds = StorageService.getAll<Bed>(STORAGE_KEYS.BEDS);
    set({ beds });
  },

  loadMedications: () => {
    const medications = StorageService.getAll<Medication>(STORAGE_KEYS.MEDICATIONS);
    set({ medications });
  },

  loadEquipment: () => {
    const equipment = StorageService.getAll<Equipment>(STORAGE_KEYS.EQUIPMENT);
    set({ equipment });
  },

  loadMedicalStaff: () => {
    const users = StorageService.getAll<User>(STORAGE_KEYS.USERS);
    const medicalStaff = users.filter((u) => u.role === 'medical');
    set({ medicalStaff });
  },

  loadAll: () => {
    get().loadDepartments();
    get().loadDoctors();
    get().loadWards();
    get().loadBeds();
    get().loadMedications();
    get().loadEquipment();
    get().loadMedicalStaff();
  },

  addDepartment: (dept) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newDept = StorageService.create<Department>(STORAGE_KEYS.DEPARTMENTS, dept);
    get().loadDepartments();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '科室管理',
        '新增',
        '科室',
        newDept.id,
        `新增科室: ${newDept.name}`
      );
    }

    return newDept;
  },

  updateDepartment: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Department>(STORAGE_KEYS.DEPARTMENTS, id, updates);
    get().loadDepartments();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '科室管理',
        '修改',
        '科室',
        id,
        `修改科室: ${updated.name}`
      );
    }

    return updated;
  },

  deleteDepartment: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const dept = StorageService.findById<Department>(STORAGE_KEYS.DEPARTMENTS, id);
    const success = StorageService.delete(STORAGE_KEYS.DEPARTMENTS, id);
    get().loadDepartments();

    if (currentUser && dept && success) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '科室管理',
        '删除',
        '科室',
        id,
        `删除科室: ${dept.name}`
      );
    }

    return success;
  },

  addDoctor: (doctor) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newDoctor = StorageService.create<Doctor>(STORAGE_KEYS.DOCTORS, doctor);
    get().loadDoctors();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '医生管理',
        '新增',
        '医生',
        newDoctor.id,
        `新增医生信息`
      );
    }

    return newDoctor;
  },

  updateDoctor: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Doctor>(STORAGE_KEYS.DOCTORS, id, updates);
    get().loadDoctors();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '医生管理',
        '修改',
        '医生',
        id,
        `修改医生信息`
      );
    }

    return updated;
  },

  deleteDoctor: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const success = StorageService.delete(STORAGE_KEYS.DOCTORS, id);
    get().loadDoctors();

    if (currentUser && success) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '医生管理',
        '删除',
        '医生',
        id,
        `删除医生信息`
      );
    }

    return success;
  },

  addMedication: (med) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newMed = StorageService.create<Medication>(STORAGE_KEYS.MEDICATIONS, med);
    get().loadMedications();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '药品管理',
        '新增',
        '药品',
        newMed.id,
        `新增药品: ${newMed.name}`
      );
    }

    return newMed;
  },

  updateMedication: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Medication>(STORAGE_KEYS.MEDICATIONS, id, updates);
    get().loadMedications();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '药品管理',
        '修改',
        '药品',
        id,
        `修改药品: ${updated.name}`
      );
    }

    return updated;
  },

  deleteMedication: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const med = StorageService.findById<Medication>(STORAGE_KEYS.MEDICATIONS, id);
    const success = StorageService.delete(STORAGE_KEYS.MEDICATIONS, id);
    get().loadMedications();

    if (currentUser && med && success) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '药品管理',
        '删除',
        '药品',
        id,
        `删除药品: ${med.name}`
      );
    }

    return success;
  },

  addEquipment: (eq) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newEq = StorageService.create<Equipment>(STORAGE_KEYS.EQUIPMENT, eq);
    get().loadEquipment();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '设备管理',
        '新增',
        '设备',
        newEq.id,
        `新增设备: ${newEq.name}`
      );
    }

    return newEq;
  },

  updateEquipment: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Equipment>(STORAGE_KEYS.EQUIPMENT, id, updates);
    get().loadEquipment();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '设备管理',
        '修改',
        '设备',
        id,
        `修改设备: ${updated.name}`
      );
    }

    return updated;
  },

  deleteEquipment: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const eq = StorageService.findById<Equipment>(STORAGE_KEYS.EQUIPMENT, id);
    const success = StorageService.delete(STORAGE_KEYS.EQUIPMENT, id);
    get().loadEquipment();

    if (currentUser && eq && success) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '设备管理',
        '删除',
        '设备',
        id,
        `删除设备: ${eq.name}`
      );
    }

    return success;
  },
}));
